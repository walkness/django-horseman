from rest_framework import serializers

from . import models


class ImageSerializer(serializers.ModelSerializer):

    class Meta:
        model = models.Image
        fields = ['pk', 'title', 'file']
