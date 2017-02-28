import os.path
from rest_framework import serializers
import pytz

from . import models


class TimezoneField(serializers.Field):

    def to_representation(self, obj):
        return str(obj)

    def to_internal_value(self, data):
        return pytz.timezone(data)


class RenditionSerializer(serializers.ModelSerializer):

    class Meta:
        model = models.Rendition
        fields = ['url', 'width', 'height', 'crop']


class RenditionsField(serializers.Field):

    def __init__(self, *args, **kwargs):
        self.sizes = kwargs.pop('sizes', [])
        super(RenditionsField, self).__init__(*args, **kwargs)

    def to_representation(self, obj):
        output = {}
        renditions = obj.all()
        uncreated_sizes = self.sizes[0:]
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
            rendition = obj.instance.get_size(*args)
            output[name] = RenditionSerializer(rendition).data

        return output

    def to_internal_value(self, data):
        print(data)
        return data


class ImageSerializer(serializers.ModelSerializer):
    renditions = RenditionsField(sizes=[
        ('thumbnail_150', (150, 150)),
        ('thumbnail_300', (300, 300)),
        ('thumbnail_600', (600, 600)),
        ('thumbnail_1200', (1200, 1200)),
    ], read_only=True)
    captured_at_tz = TimezoneField(required=False, allow_null=True)

    class Meta:
        model = models.Image
        fields = [
            'pk', 'title', 'url', 'width', 'height', 'created_at', 'created_by', 'captured_at',
            'captured_at_tz', 'renditions', 'meta']
        read_only_fields = [
            'pk', 'url', 'width', 'height', 'created_at', 'created_by', 'captured_at', 'renditions',
            'meta']
        extra_kwargs = {
            'title': {'required': False, 'allow_null': True}
        }

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
