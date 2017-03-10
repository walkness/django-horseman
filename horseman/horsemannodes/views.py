import re

from django.db.models import Q, Prefetch

from rest_framework import viewsets
from rest_framework.decorators import detail_route

from horseman.horsemancomments.views import CommentViewSet

from . import models, serializers


class NodeViewSet(viewsets.ModelViewSet):
    model = models.Node
    serializer_class = serializers.NodeSerializer
    queryset = models.Node.objects.all()

    def get_serializer_class(self):
        node_class = self.get_node_class()
        return serializers.get_node_serializer_class(node_class, node_class.api_fields)

    def get_serializer(self, *args, **kwargs):
        kwargs['related_nodes'] = self.action == 'retrieve'
        return super(NodeViewSet, self).get_serializer(*args, **kwargs)

    def get_queryset(self):
        node_class = self.get_node_class()
        qs = node_class.objects.all()

        search = self.request.query_params.get('s', None)
        if search:
            queries = []
            for f in node_class.search_fields:
                kwarg = {}
                kwarg['%s__iregex' % f] = r'(?:^|\s)%s' % re.escape(search)
                queries.append(Q(**kwarg))
            if len(queries) > 0:
                query = queries.pop()
                for item in queries:
                    query |= item
                qs = qs.filter(query)

        prefetch_fields = []
        for field in node_class._meta.get_fields():
            if field.many_to_many and not field.auto_created:
                if field.__class__.__name__ == 'TaggableManager':
                    prefetch_fields.append(field.name)
                else:
                    prefetch_fields.append(Prefetch(field.name, queryset=field.related_model.objects.select_related('node_ptr')))
        if len(prefetch_fields) > 0:
            qs = qs.prefetch_related(*prefetch_fields)

        if hasattr(qs, 'prefetch_related_images'):
            qs = qs.prefetch_related_images()

        return qs

    def get_node_class(self):
        node_type = self.request.query_params.get('type', None)
        if node_type:
            return models.Node.get_class_from_type(node_type)
        return models.Node

    @detail_route(methods=['GET'])
    def comments(self, request, pk):
        return CommentViewSet.as_view({'get': 'list'})(request, obj_pk=pk)
