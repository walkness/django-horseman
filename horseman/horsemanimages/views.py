from rest_framework import viewsets
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.decorators import parser_classes
from rest_framework.response import Response
from rest_framework.status import (
    HTTP_201_CREATED, HTTP_400_BAD_REQUEST)

from horseman.mixins import SearchableMixin

from . import models
from . import serializers


class ImageViewSet(SearchableMixin, viewsets.ModelViewSet):
    model = models.Image
    serializer_class = serializers.ImageSerializer
    queryset = models.Image.objects.prefetch_related('renditions').all()
    search_query_param = 'search'
    search_fields = ['title']

    @parser_classes((FormParser, MultiPartParser,))
    def create(self, request, *args, **kwargs):
        file = request.data.get('file', None)
        data = request.data.get('data', {})

        serializer = self.serializer_class(data=data)
        if serializer.is_valid(raise_exception=True):
            instance = serializer.save(file=file, created_by=request.user)
            return Response(
                self.serializer_class(instance).data,
                status=HTTP_201_CREATED
            )

        return Response(status=HTTP_400_BAD_REQUEST)
