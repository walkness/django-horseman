from django.core.exceptions import FieldDoesNotExist

from rest_framework import serializers

from markupfield.fields import MarkupField as MarkupModelField

from . import models


class MarkupField(serializers.Field):

    def to_representation(self, obj):
        return {att:getattr(obj, att) for att in ['raw', 'rendered', 'markup_type']}

    def to_internal_value(self, value):
        print(value)
        return value


class CommentSerializer(serializers.ModelSerializer):

    class Meta:
        model = models.Comment
        fields = models.Comment.api_fields

    def __init__(self, *args, **kwargs):
        super(CommentSerializer, self).__init__(*args, **kwargs)
        for field in self.Meta.fields:
            try:
                model_field = self.Meta.model._meta.get_field(field)
            except FieldDoesNotExist:
                pass
            else:
                if isinstance(model_field, MarkupModelField):
                    self.fields[field] = MarkupField()


def get_comment_serializer_class(model_class=None, serializer_fields_=None):
    serializer_fields = serializer_fields_
    if not serializer_fields and model_class:
        serializer_fields = model_class.api_fields
    elif not serializer_fields:
        serializer_fields = models.Comment.api_fields

    class Meta:
        model = model_class or models.Comment
        fields = serializer_fields

    return type('{}Serializer'.format(model_class.__name__), (CommentSerializer, ), {
        'Meta': Meta,
    })
