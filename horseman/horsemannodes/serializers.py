from django.db.models import ForeignKey

from rest_framework import serializers

from horseman.horsemanimages.serializers import ImageSerializer

from . import models


class NodeSerializer(serializers.ModelSerializer):
    title = serializers.SerializerMethodField()

    class Meta:
        model = models.Node
        fields = models.Node.api_fields + ['title']

    def __init__(self, *args, **kwargs):
        self.current_model_class = kwargs.pop(
            'current_model_class', self.__class__.Meta.model)
        super(NodeSerializer, self).__init__(*args, **kwargs)
        single_instance = self.instance
        if isinstance(self.instance, list):
            if len(self.instance) > 0:
                single_instance = self.instance[0]
            else:
                single_instance = None

        if single_instance and single_instance.__class__ is not models.Node:
            extra_model_fields = [
                field for field in single_instance.__class__.api_fields
                if field not in models.Node.api_fields
            ]
            for field in extra_model_fields:
                model_field = single_instance.__class__._meta.get_field(field)
                if isinstance(model_field, ForeignKey):
                    self.fields[field] = serializers.PrimaryKeyRelatedField(
                        queryset=model_field.related_model.objects.all())
                else:
                    self.fields[field] = serializers.ModelField(model_field=model_field)

            get_related_images = getattr(single_instance, 'get_related_images', None)
            if callable(get_related_images):
                self.fields['related_images'] = ImageSerializer(
                    source='get_related_images', many=True)

    def get_current_model_class(self):
        model_class = self.current_model_class
        if self.instance:
            model_class = self.instance.__class__
        return model_class

    def get_title(self, obj):
        if hasattr(obj, 'title'):
            return obj.title
        return obj.get_title()

    def validate(self, attrs):
        model_class = self.get_current_model_class()
        instance = model_class(**attrs)
        instance.full_clean()
        return attrs


class NodeConfigurationSerializer(serializers.Serializer):
    node_type = serializers.CharField()
    app_label = serializers.CharField(source='_meta.app_label')
    model_name = serializers.CharField(source='_meta.model_name')
    name = serializers.CharField(source='_meta.verbose_name')
    name_plural = serializers.CharField(source='_meta.verbose_name_plural')
    num_nodes = serializers.IntegerField()
    field_config = serializers.SerializerMethodField()
    admin_fields = serializers.ListField()

    def get_field_config(self, cls):
        field_config = {}
        fields = cls.get_editable_fields()
        for field in fields:
            field_config[field.name] = {
                'type': '{}.{}'.format(
                    field.__module__,
                    field.__class__.__name__
                )
            }

            for att in [
                'name', 'verbose_name', 'verbose_name_plural', 'max_length', 'blank'
            ]:
                field_config[field.name][att] = getattr(field, att, None)

            if isinstance(field, ForeignKey):
                field_config[field.name]['related_model'] = '{}.{}'.format(
                    field.related_model.__module__, field.related_model.__name__)

            extra_config = getattr(field, 'get_extra_config', None)
            if callable(extra_config):
                field_config[field.name].update(extra_config())
            
        return field_config
