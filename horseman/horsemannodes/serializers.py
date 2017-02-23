from rest_framework import serializers

from . import models


class NodeSerializer(serializers.ModelSerializer):
    title = serializers.SerializerMethodField()

    class Meta:
        model = models.Node
        fields = models.Node.api_fields + ['title']

    def __init__(self, *args, **kwargs):
        super(NodeSerializer, self).__init__(*args, **kwargs)
        single_instance = self.instance
        if isinstance(self.instance, list):
            single_instance = self.instance[0]

        if single_instance and single_instance.__class__ is not models.Node:
            extra_model_fields = [
                field for field in single_instance.__class__.api_fields
                if field not in models.Node.api_fields
            ]
            for field in extra_model_fields:
                self.fields[field] = serializers.ModelField(
                    model_field=single_instance.__class__._meta.get_field(field))

    def get_title(self, obj):
        if hasattr(obj, 'title'):
            return obj.title
        return obj.get_title()


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

            extra_config = getattr(field, 'get_extra_config', None)
            if callable(extra_config):
                field_config[field.name].update(extra_config())
            
        return field_config
