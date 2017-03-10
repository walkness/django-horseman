from django.db.models import ForeignKey, ManyToManyField
from django.core.exceptions import ValidationError

from rest_framework import serializers
from rest_framework.utils import model_meta
from rest_framework.exceptions import ValidationError as DRFValidationError

from taggit_serializer.serializers import (TagListSerializerField,
                                           TaggitSerializer)

from horseman.horsemanimages.serializers import ImageSerializer

from . import models


class RelatedNodesField(serializers.Field):

    def to_representation(self, obj):
        nodes = {}
        for node_type, ids in obj.items():
            node_class = models.Node.get_class_from_type(node_type)
            serializer_class = get_node_serializer_class(node_class, node_class.api_fields)
            serializer = serializer_class(
                node_class.objects.filter(pk__in=ids), many=True,
                related_images=False, related_nodes=False)
            nodes[node_type] = serializer.data
        return nodes


class NodeSerializer(TaggitSerializer, serializers.ModelSerializer):

    class Meta:
        model = models.Node
        fields = models.Node.api_fields

    def __init__(self, *args, **kwargs):
        include_related_images = kwargs.pop('related_images', True)
        include_related_nodes = kwargs.pop('related_nodes', False)

        super(NodeSerializer, self).__init__(*args, **kwargs)

        generic_model = self.Meta.model()

        if 'title' not in generic_model.api_fields:
            self.fields['title'] = serializers.SerializerMethodField()

        if 'tags' in generic_model.api_fields:
            self.fields['tags'] = TagListSerializerField()

        if include_related_images:
            get_related_images = getattr(generic_model, 'get_related_images', None)
            if callable(get_related_images):
                self.fields['related_images'] = serializers.SerializerMethodField()

        if include_related_nodes:
            self.fields['related_nodes'] = RelatedNodesField(source='get_related_node_ids')

    def get_title(self, obj):
        if hasattr(obj, 'title'):
            return obj.title
        return obj.get_title()

    def validate(self, attrs):
        m2m_fields = {}
        for field in self.Meta.model._meta.get_fields():
            if field.many_to_many:
                if field.name in attrs:
                    m2m_fields[field.name] = attrs.pop(field.name)
        instance = self.Meta.model(**attrs)
        try:
            instance.full_clean()
        except ValidationError as e:
            error = {}
            for field, errors in e.error_dict.items():
                error[field] = [err.message for err in errors]
            raise DRFValidationError(error)
        attrs.update(m2m_fields)
        return attrs

    def get_related_images(self, obj):
        images, renditions = obj.get_related_images()
        return ImageSerializer(images, many=True, extra_image_sizes=renditions).data


def get_node_serializer_class(model_class=None, serializer_fields=None):
    class Meta:
        model = model_class or models.Node
        fields = serializer_fields or models.Node.api_fields

    return type('{}Serializer'.format(model_class.__name__), (NodeSerializer, ), {
        'Meta': Meta,
    })
