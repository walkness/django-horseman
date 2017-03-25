from django.apps import apps

from rest_framework import viewsets

from horseman.horsemannodes.models import Node

from . import models, serializers


class CommentViewSet(viewsets.ModelViewSet):
    model = models.Comment
    serializer_class = serializers.CommentSerializer
    queryset = models.Comment.objects.select_related('user').all()

    def get_serializer_class(self):
        comment_class = self.get_comment_class()
        return serializers.get_comment_serializer_class(comment_class)

    def get_queryset(self):
        comment_class = self.get_comment_class()
        qs = comment_class.objects.select_related('user').all()

        obj_pk = self.kwargs.get('obj_pk', None)
        if obj_pk:
            obj_field = comment_class.comment_for_node_field
            qs = qs.filter(**{'{}__pk'.format(obj_field): obj_pk})

        return qs

    def get_comment_class(self):
        type_param = self.request.query_params.get('type', None)
        if type_param:
            app_label, model_name = type_param.split('.')
            type_class = apps.get_model(app_label=app_label, model_name=model_name)
            if type_class:
                if issubclass(type_class, models.Comment):
                    return type_class
                elif issubclass(type_class, Node):
                    for field in type_class._meta.get_fields():
                        if field.related_model and issubclass(field.related_model, models.Comment):
                            return field.related_model
        return models.Comment
