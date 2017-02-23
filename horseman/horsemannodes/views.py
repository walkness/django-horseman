from rest_framework import viewsets

from . import models, serializers


class NodeViewSet(viewsets.ModelViewSet):
    model = models.Node
    serializer_class = serializers.NodeSerializer
    queryset = models.Node.objects.all()

    def get_queryset(self):
        node_class = models.Node
        node_type = self.request.query_params.get('type', None)
        if node_type:
            node_class = models.Node.get_node_class_from_type(node_type)
        qs = node_class.objects.all()
        return qs
