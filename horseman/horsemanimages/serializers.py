from rest_framework import serializers

from . import models


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
        return data


class ImageSerializer(serializers.ModelSerializer):
    renditions = RenditionsField(sizes=[
        ('thumbnail_150', (150, 150)),
        ('thumbnail_300', (300, 300)),
    ])

    class Meta:
        model = models.Image
        fields = ['pk', 'title', 'url', 'width', 'height', 'created_at', 'created_by', 'renditions']
