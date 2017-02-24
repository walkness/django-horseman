from rest_framework import viewsets

from . import models
from . import serializers


class ImageViewSet(viewsets.ModelViewSet):
    model = models.Image
    serializer_class = serializers.ImageSerializer
    queryset = models.Image.objects.all()
