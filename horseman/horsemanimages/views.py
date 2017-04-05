from rest_framework import viewsets
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.decorators import parser_classes, detail_route
from rest_framework.response import Response
from rest_framework.status import (
    HTTP_201_CREATED, HTTP_400_BAD_REQUEST)

from django_filters import rest_framework as filters, DateFilter

from horseman.mixins import SearchableMixin, BoolQueryParamMixin

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


class ImageViewSet(BoolQueryParamMixin, SearchableMixin, viewsets.ModelViewSet):
    model = models.Image
    serializer_class = serializers.AdminImageSerializer
    queryset = models.Image.objects.prefetch_related('renditions').order_by('-created_at').all()
    search_query_param = 'search'
    search_fields = ['title']
    filter_class = ImageFilter

    def get_serializer(self, *args, **kwargs):
        if self.get_query_param_bool('async_renditions'):
            kwargs['async_renditions'] = True
        return super(ImageViewSet, self).get_serializer(*args, **kwargs)

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

    @detail_route(methods=['GET'])
    def renditions(self, request, pk):
        return RenditionViewSet.as_view({'get': 'list'})(request, image_pk=pk)


class RenditionViewSet(viewsets.ModelViewSet):
    model = models.Rendition
    serializer_class = serializers.RenditionSerializer
    queryset = models.Rendition.objects.all()

    def get_queryset(self):
        qs = super(RenditionViewSet, self).get_queryset()

        image_pk = self.kwargs.get('image_pk', None)
        if image_pk:
            qs = qs.filter(image_id=image_pk)

        return qs
