import os.path
from io import BytesIO
from rest_framework import serializers
from rest_framework.exceptions import APIException
import pytz

from . import models, tasks


class DuplicateImageError(APIException):
    status_code = 400
    default_detail = 'An image like this already exists'
    default_code = 'duplicate'

    def __init__(self, detail, code=None, duplicates=None):
        self.duplicates = duplicates
        super(DuplicateImageError, self).__init__(detail, code)
        self.detail.duplicates = duplicates

    def get_full_details(self):
        details = super(DuplicateImageError, self).get_full_details()
        details['duplicates'] = self.duplicates
        return details


class TimezoneField(serializers.Field):

    def to_representation(self, obj):
        return str(obj)

    def to_internal_value(self, data):
        return pytz.timezone(data)


class RenditionSerializer(serializers.ModelSerializer):

    class Meta:
        model = models.Rendition
        fields = ['pk', 'url', 'width', 'height', 'crop', 'mime_type', 'filesize', 'target']


class RenditionsField(serializers.Field):

    def __init__(self, *args, **kwargs):
        self.sizes = []
        if len(args) > 0:
            self.sizes = args[0]
        super(RenditionsField, self).__init__(*args, **kwargs)

    def to_representation(self, obj):
        output = {}
        renditions = obj.all()
        sizes = self.sizes[0:]
        if isinstance(self.parent, ImageSerializer):
            sizes.extend(self.parent.extra_image_sizes.get(str(obj.instance.pk), []))
        uncreated_sizes = []
        for name, args in sizes:
            rendition = None
            for _rendition in renditions:
                if _rendition.equals_size(*args):
                    rendition = _rendition
            if rendition:
                output[name] = RenditionSerializer(rendition).data
            else:
                uncreated_sizes.append((name, args))

        if len(uncreated_sizes) == 0:
            return output

        for name, args in uncreated_sizes:
            rendition = self.get_size(obj, *args)
            output[name] = RenditionSerializer(rendition).data

        return output

    def get_size(self, obj, *args):
        kwargs = {}
        if getattr(self, 'async_renditions', False):
            kwargs['handle_create_rendition'] = tasks.create_image_rendition.delay
        return obj.instance.get_size(*args, **kwargs)


class ImageSerializer(serializers.ModelSerializer):
    renditions = RenditionsField()
    captured_at_tz = TimezoneField(required=False, allow_null=True)

    class Meta:
        model = models.Image
        fields = [
            'pk', 'title', 'file', 'original_filename', 'url', 'mime_type', 'filesize', 'width',
            'height', 'created_at', 'created_by', 'captured_at', 'captured_at_tz', 'renditions',
            'meta']
        read_only_fields = [
            'pk', 'url', 'width', 'height', 'mime_type', 'filesize', 'created_at', 'created_by',
            'captured_at', 'renditions', 'meta']
        extra_kwargs = {
            'title': {'required': False, 'allow_null': True},
            'file': {'required': False, 'write_only': True},
        }

    def __init__(self, *args, **kwargs):
        self.extra_image_sizes = kwargs.pop('extra_image_sizes', {})
        self.async_renditions = kwargs.pop('async_renditions', False)
        self.replace_images = kwargs.pop('replace', None)
        self.ignore_duplicates = kwargs.pop('ignore_duplicates', None)
        self.ignore_duplicate_hash = kwargs.pop('ignore_duplicate_hash', False)
        self.ignore_duplicate_name = kwargs.pop('ignore_duplicate_name', False)
        self.ignore_duplicate_exif = kwargs.pop('ignore_duplicate_exif', False)
        super(ImageSerializer, self).__init__(*args, **kwargs)
        self.fields['renditions'].async_renditions = self.async_renditions

    def get_duplicate_queryset(self):
        queryset = models.Image.objects.all()
        if self.replace_images:
            queryset = queryset.exclude(pk__in=self.replace_images)
        if self.ignore_duplicates:
            queryset = queryset.exclude(pk__in=self.ignore_duplicates)
        return queryset

    def validate_file(self, data):
        if not self.ignore_duplicate_hash:
            self.file_hash = models.compute_hash(data.file)
            duplicates = self.get_duplicate_queryset().filter(
                hash=self.file_hash).values_list('pk', flat=True)
            if len(duplicates) > 0:
                raise DuplicateImageError(
                    'This file has already been uploaded',
                    code='duplicate_hash',
                    duplicates=duplicates,
                )

        if not self.ignore_duplicate_name:
            duplicates = self.get_duplicate_queryset().filter(
                original_filename=data.name).values_list('pk', flat=True)
            if len(duplicates) > 0:
                raise DuplicateImageError(
                    'A file with the same name has already been uploaded',
                    code='duplicate_name',
                    duplicates=duplicates,
                )

        if not self.ignore_duplicate_exif:
            self.file_exif = models.get_exif_json(data.file)
            if len(self.file_exif.keys()) > 0:
                exif = self.file_exif.get('EXIF', {})
                duplicates = self.get_duplicate_queryset().filter(
                    exif_data__EXIF__DateTimeDigitized=exif.get('DateTimeDigitized'),
                    exif_data__EXIF__BodySerialNumber=exif.get('BodySerialNumber'),
                ).values_list('pk', flat=True)
                if len(duplicates) > 0:
                    raise DuplicateImageError(
                        'A file captured at the same time from the same camera has already been uploaded',
                        code='duplicate_exif',
                        duplicates=duplicates,
                    )

        return data

    def create(self, validated_data):
        file = validated_data.pop('file')
        file_bytes = validated_data.pop('file_bytes', None)

        if self.replace_images:
            instances = models.Image.objects.filter(pk__in=self.replace_images)
            updated = []
            for instance in instances:
                updated.append(self.update(instance, {
                    'file': file,
                    'file_bytes': file_bytes,
                }))
            return updated

        if 'title' not in validated_data:
            fname_wo_ext, ext = os.path.splitext(os.path.basename(file.name))
            validated_data['title'] = fname_wo_ext
        instance = self.__class__.Meta.model(**validated_data)

        if hasattr(self, 'file_hash'):
            instance.hash = self.file_hash

        instance.file_bytes = file_bytes
        instance.filesize = file.size
        instance.original_filename = file.name
        instance.file.save(file.name, file, save=False)

        if hasattr(self, 'file_exif'):
            instance.exif_data = self.file_exif
            instance.update_capture_time_from_exif(self.file_exif)
            instance.exif_updated = True
        else:
            instance.update_exif(file_bytes)

        instance.save()
        return instance

    def update(self, instance, validated_data):
        file = validated_data.pop('file', None)
        file_bytes = validated_data.pop('file_bytes', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if file:
            if not file_bytes:
                file.seek(0)
                file_bytes = BytesIO(file.read())
            instance.file_bytes = file_bytes

            if not hasattr(self, 'file_hash'):
                self.file_hash = models.compute_hash(file_bytes)
            instance.hash = self.file_hash

            if 'title' not in validated_data:
                old_fname, ext = os.path.splitext(os.path.basename(instance.file.name))
                if old_fname.lower() == instance.title.lower():
                    new_fname, ext = os.path.splitext(os.path.basename(file.name))
                    instance.title = new_fname

            instance.original_filename = file.name
            instance.filesize = file.size
            instance.captured_at_tz = None
            instance.file.save(file.name, file, save=False)

            if not hasattr(self, 'file_exif'):
                self.file_exif = models.get_exif_json(file_bytes)

            instance.exif_data = self.file_exif
            instance.update_capture_time_from_exif(self.file_exif)
            instance.exif_updated = True

        instance.save()
        if file:
            instance.renditions.all().delete()
        return instance


class AdminImageSerializer(ImageSerializer):
    renditions = RenditionsField(models.Image.admin_sizes)
