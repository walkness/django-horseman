from rest_framework import viewsets
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.decorators import parser_classes
from rest_framework.response import Response
from rest_framework.status import (
    HTTP_201_CREATED, HTTP_400_BAD_REQUEST)

from django_filters import rest_framework as filters, DateFilter

from horseman.mixins import SearchableMixin

from . import models
from . import serializers


class ImageFilter(filters.FilterSet):
    uploaded_before = DateFilter(name='created_at', lookup_expr='lte')
    uploaded_after = DateFilter(name='created_at', lookup_expr='gte')
    captured_before = DateFilter(name='captured_at', lookup_expr='lte')
    captured_after = DateFilter(name='captured_at', lookup_expr='gte')

    class Meta:
        model = models.Image
        fields = ['uploaded_before', 'uploaded_after', 'captured_before', 'captured_after']


class ImageViewSet(SearchableMixin, viewsets.ModelViewSet):
    model = models.Image
    serializer_class = serializers.AdminImageSerializer
    queryset = models.Image.objects.prefetch_related('renditions').order_by('-created_at').all()
    search_query_param = 'search'
    search_fields = ['title']
    filter_class = ImageFilter

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
