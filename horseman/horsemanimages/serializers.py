import os.path
from rest_framework import serializers
import pytz

from . import models, tasks


class TimezoneField(serializers.Field):

    def to_representation(self, obj):
        return str(obj)

    def to_internal_value(self, data):
        return pytz.timezone(data)


class RenditionSerializer(serializers.ModelSerializer):

    class Meta:
        model = models.Rendition
        fields = ['url', 'width', 'height', 'crop', 'mime_type']


class RenditionsField(serializers.Field):

    def __init__(self, *args, **kwargs):
        self.sizes = kwargs.pop('sizes', [])
        super(RenditionsField, self).__init__(*args, **kwargs)

    def to_representation(self, obj):
        output = {}
        renditions = obj.all()
        sizes = self.sizes[0:]
        if isinstance(self.parent, ImageSerializer):
            sizes.extend(self.parent.extra_image_sizes.get(str(obj.instance.pk), []))
        uncreated_sizes = sizes[0:]
        for rendition in renditions:
            i = 0
            for name, args in uncreated_sizes:
                if rendition.equals_size(*args):
                    output[name] = RenditionSerializer(rendition).data
                    del uncreated_sizes[i]
                i += 1
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

    def to_internal_value(self, data):
        print(data)
        return data


class ImageSerializer(serializers.ModelSerializer):
    renditions = RenditionsField()
    captured_at_tz = TimezoneField(required=False, allow_null=True)

    class Meta:
        model = models.Image
        fields = [
            'pk', 'title', 'url', 'mime_type', 'width', 'height', 'created_at', 'created_by',
            'captured_at', 'captured_at_tz', 'renditions', 'meta']
        read_only_fields = [
            'pk', 'url', 'width', 'height', 'mime_type', 'created_at', 'created_by', 'captured_at',
            'renditions', 'meta']
        extra_kwargs = {
            'title': {'required': False, 'allow_null': True}
        }

    def __init__(self, *args, **kwargs):
        self.extra_image_sizes = kwargs.pop('extra_image_sizes', {})
        self.async_renditions = kwargs.pop('async_renditions', False)
        super(ImageSerializer, self).__init__(*args, **kwargs)
        self.fields['renditions'].async_renditions = self.async_renditions

    def create(self, validated_data):
        file = validated_data.pop('file')
        if 'title' not in validated_data:
            fname_wo_ext, ext = os.path.splitext(os.path.basename(file.name))
            validated_data['title'] = fname_wo_ext
        instance = self.__class__.Meta.model(**validated_data)
        instance.file_bytes = file.file
        instance.file.save(file.name, file, save=False)
        instance.update_exif(file)
        instance.save()
        return instance


class AdminImageSerializer(ImageSerializer):
    renditions = RenditionsField(sizes=[
        ('thumbnail_150', (150, 150)),
        ('thumbnail_300', (300, 300)),
        ('thumbnail_600', (600, 600)),
        ('thumbnail_1200', (1200, 1200)),
    ], read_only=True)
