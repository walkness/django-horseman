from django.utils import timezone
from django.core.exceptions import ValidationError

from rest_framework import serializers
from rest_framework.exceptions import ValidationError as DRFValidationError

from taggit_serializer.serializers import (TagListSerializerField,
                                           TaggitSerializer)

from horseman.horsemanimages.serializers import AdminImageSerializer
from horseman.horsemanusers import get_user_serializer

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
        self.include_related_images = kwargs.pop('related_images', False)
        self.include_featured_image = kwargs.pop('featured_image', False)
        self.include_related_nodes = kwargs.pop('related_nodes', False)
        self.include_active_revision = kwargs.pop('active_revision', False)
        self.include_latest_revision = kwargs.pop('latest_revision', False)

        super(NodeSerializer, self).__init__(*args, **kwargs)

        generic_model = self.Meta.model()

        if 'title' not in generic_model.api_fields:
            self.fields['title'] = serializers.SerializerMethodField()

        if 'tags' in generic_model.api_fields:
            self.fields['tags'] = TagListSerializerField(required=False)

        if self.include_related_images or (
            self.include_featured_image and generic_model.admin_featured_image
        ):
            get_related_images = getattr(generic_model, 'get_related_images', None)
            get_featured_image = getattr(generic_model, 'get_featured_image', None)
            if callable(get_related_images) or callable(get_featured_image):
                self.fields['related_images'] = serializers.SerializerMethodField()

        if self.include_related_nodes:
            self.fields['related_nodes'] = RelatedNodesField(source='get_related_node_ids')

        if self.include_active_revision:
            self.fields['active_revision'] = NodeRevisionSerializer(read_only=True)

        if self.include_latest_revision:
            self.fields['latest_revision'] = NodeRevisionSerializer(read_only=True)

        self.fields['revision'] = NodeRevisionSerializer(read_only=True)

    def create(self, validated_data):
        user = validated_data.pop('user', None)
        publish = validated_data.pop('publish', False)
        unpublish = validated_data.pop('unpublish', False)
        author = validated_data.pop('author', None)
        validated_data['author'] = author if author else user
        validated_data['created_by'] = user
        if publish:
            validated_data['published'] = True
        instance = super(NodeSerializer, self).create(validated_data)
        revision = instance.create_revision(created_by=user, active=publish)
        instance.revision = revision
        return instance

    def update(self, instance, validated_data):
        user = validated_data.pop('user', None)
        publish = validated_data.pop('publish', False)
        unpublish = validated_data.pop('unpublish', False)
        published = (publish or instance.published) and not unpublish

        if publish or not published:
            validated_data['published'] = published
            validated_data['modified_at'] = timezone.now()
            instance = super(NodeSerializer, self).update(instance, validated_data)

        revision = instance.create_revision(
            created_by=user,
            active=publish,
            validated_data=validated_data,
        )
        instance.revision = revision
        return instance

    def get_title(self, obj):
        if hasattr(obj, 'title'):
            return obj.title
        return obj.get_title()

    def validate(self, attrs):
        m2m_fields = {}
        exclude_fields = []
        for field in self.Meta.model._meta.get_fields():
            if field.name not in attrs:
                exclude_fields.append(field.name)
            elif field.many_to_many:
                exclude_fields.append(field.name)
                m2m_fields[field.name] = attrs.pop(field.name)
        instance = self.Meta.model(**attrs)
        try:
            instance.full_clean(exclude=exclude_fields)
        except ValidationError as e:
            error = {}
            for field, errors in e.error_dict.items():
                error[field] = [err.message for err in errors]
            raise DRFValidationError(error)
        attrs.update(m2m_fields)
        return attrs

    def get_related_images(self, obj):
        images = []
        if self.include_related_images:
            images, renditions = obj.get_related_images()
        elif self.include_featured_image:
            image, renditions = obj.get_featured_image()
            if image:
                images = [image]
        return AdminImageSerializer(
            images, many=True, extra_image_sizes=renditions,
            async_renditions=getattr(self, 'async_renditions', False)
        ).data


class NodeWithRevisionSerializer(NodeSerializer):

    def __init__(self, *args, **kwargs):
        self.revision = kwargs.pop('revision')
        super(NodeWithRevisionSerializer, self).__init__(*args, **kwargs)

    def to_representation(self, instance):
        instance = instance.as_revision(self.revision)
        output = super(NodeWithRevisionSerializer, self).to_representation(instance)
        output['revision'] = NodeRevisionSerializer(self.revision).data
        return output


def get_node_serializer_class(model_class=None, serializer_fields=None):
    class Meta:
        model = model_class or models.Node
        fields = serializer_fields or models.Node.api_fields

    return type(
        '{}Serializer'.format(model_class.__name__),
        (NodeSerializer, ), {
            'Meta': Meta,
        }
    )


class NodeRevisionSerializer(serializers.ModelSerializer):
    created_by = get_user_serializer()(read_only=True)
    is_latest = serializers.BooleanField(read_only=True)

    class Meta:
        model = models.NodeRevision
        fields = ['pk', 'created_by', 'created_at', 'active', 'is_latest', 'preview_url']
