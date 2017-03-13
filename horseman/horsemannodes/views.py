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
                    prefetch_fields.append(Prefetch(
                        field.name,
                        queryset=field.related_model.objects.select_related('node_ptr')))
        if len(prefetch_fields) > 0:
            qs = qs.prefetch_related(*prefetch_fields)

        if hasattr(qs, 'prefetch_related_images'):
            qs = qs.prefetch_related_images()

        return qs

    def get_object(self):
        obj = super(NodeViewSet, self).get_object()
        revision = self.get_revision()
        if revision:
            obj = obj.as_revision(revision)
        return obj

    def perform_create(self, serializer):
        return self.perform_update(serializer)

    def perform_update(self, serializer):
        publish_param = self.request.query_params.get('publish', False)
        publish = publish_param
        if isinstance(publish_param, str):
            publish = publish_param.lower() in ['true', 't', '1', 'yes', 'y']
        return serializer.save(user=self.request.user, publish=publish)

    def get_node_class(self):
        node_type = self.request.query_params.get('type', None)
        if node_type:
            return models.Node.get_class_from_type(node_type)
        return models.Node

    def get_revision(self):
        if not hasattr(self, '_revision_obj'):
            self._revision_obj = None
            revision_param = self.request.query_params.get('revision', None)
            if revision_param:
                if revision_param == 'latest':
                    self._revision_obj = models.NodeRevision.objects.filter(
                        node_id=self.kwargs['pk']).order_by('-created_at').first()
                elif revision_param == 'active':
                    pass
                else:
                    self._revision_obj = models.NodeRevision.objects.filter(
                        pk=revision_param).first()
        return self._revision_obj

    @detail_route(methods=['GET'])
    def comments(self, request, pk):
        return CommentViewSet.as_view({'get': 'list'})(request, obj_pk=pk)

    @detail_route(methods=['GET'])
    def revisions(self, request, pk):
        return NodeRevisionViewSet.as_view({'get': 'list'})(request, node_pk=pk)


class NodeRevisionViewSet(viewsets.ModelViewSet):
    model = models.NodeRevision
    serializer_class = serializers.NodeRevisionSerializer
    queryset = models.NodeRevision.objects.all()

    def get_queryset(self):
        qs = self.queryset

        node_pk = self.kwargs.get('node_pk', None)
        if node_pk:
            qs = qs.filter(node_id=node_pk)

        return qs
