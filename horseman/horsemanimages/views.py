from django.db.models import Case, When, IntegerField

from rest_framework import viewsets
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.decorators import parser_classes, detail_route
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from rest_framework.status import (
    HTTP_201_CREATED, HTTP_400_BAD_REQUEST)
from rest_framework.filters import OrderingFilter

from django_filters import rest_framework as filters, DateFilter
from django_filters.rest_framework import DjangoFilterBackend

from horseman.mixins import SearchableMixin, BoolQueryParamMixin
from horseman.horsemannodes.serializers import NodeSerializer

from . import models
from . import serializers


class IgnoreNullOrderingFilter(OrderingFilter):
    
    def filter_queryset(self, request, queryset, view):
        ordering = self.get_ordering(request, queryset, view)

        if ordering:
            annotations = {}
            new_ordering = []
            for field in ordering:
                orderless_field = field.lstrip('-')
                null_field = 'null_%s' % orderless_field
                annotations[null_field] = Case(When(
                    then=0,
                    **{'{}__isnull'.format(orderless_field): True}),
                default=1, output_field=IntegerField())
                new_ordering.extend(['-%s' % null_field, field])
            queryset = queryset.annotate(**annotations).order_by(*new_ordering)

        return queryset


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
    queryset = models.Image.objects.prefetch_related('renditions').all()
    search_query_param = 'search'
    search_fields = ['title']
    filter_backends = (IgnoreNullOrderingFilter, DjangoFilterBackend, )
    filter_class = ImageFilter
    ordering_fields = ('created_at', 'captured_at')
    ordering = ('-created_at',)

    def get_serializer(self, *args, **kwargs):
        if self.get_query_param_bool('async_renditions'):
            kwargs['async_renditions'] = True
        return super(ImageViewSet, self).get_serializer(*args, **kwargs)

    @parser_classes((FormParser, MultiPartParser,))
    def create(self, request, *args, **kwargs):
        file = request.data.get('file', None)
        data = request.data.get('data', {})
        data['file'] = file

        serializer = self.serializer_class(data=data)
        if serializer.is_valid(raise_exception=True):
            instance = serializer.save(created_by=request.user)
            return Response(
                self.serializer_class(instance).data,
                status=HTTP_201_CREATED
            )

        return Response(status=HTTP_400_BAD_REQUEST)

    @parser_classes((FormParser, MultiPartParser, ))
    @detail_route(methods=['PUT'])
    def file(self, request, *args, **kwargs):
        file = request.data.get('file', None)
        data = request.data.get('data', {})
        if not file:
            raise ValidationError('Must include a file.')

        data['file'] = file

        instance = self.get_object()
        serializer = self.get_serializer(instance, data=data, partial=True)
        try:
            if serializer.is_valid(raise_exception=True):
                serializer.save()
                return Response(serializer.data)
        except serializers.DuplicateImageError as exc:
            print(exc.__class__)
            raise exc

        return Response(status=HTTP_400_BAD_REQUEST)

    @detail_route(methods=['GET'])
    def renditions(self, request, pk):
        return RenditionViewSet.as_view({'get': 'list'})(request, image_pk=pk)

    @detail_route(methods=['GET'])
    def usage(self, request, pk):
        instance = self.get_object()
        nodes_by_type = instance.get_related_nodes()
        serialized_nodes = {}
        for node_type, nodes in nodes_by_type.items():
            serialized_nodes[node_type] = NodeSerializer(nodes, many=True).data
        return Response(serialized_nodes)


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
