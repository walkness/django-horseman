from django.apps import apps
from django.db.models import ForeignKey, ManyToManyField

from rest_framework import serializers

from horseman.horsemannodes.models import Node


class AdminModelConfigurationSerializer(serializers.Serializer):
    node_type = serializers.CharField(source='type')
    app_label = serializers.CharField(source='_meta.app_label')
    app_admin_order = serializers.SerializerMethodField()
    model_name = serializers.CharField(source='_meta.model_name')
    name = serializers.CharField(source='_meta.verbose_name')
    name_plural = serializers.CharField(source='_meta.verbose_name_plural')
    num_nodes = serializers.IntegerField(source='num')
    field_config = serializers.SerializerMethodField()
    admin_fields = serializers.ListField()
    admin_order = serializers.IntegerField()

    def get_app_admin_order(self, cls):
        return getattr(apps.get_app_config(cls._meta.app_label), 'admin_order', 0)

    def get_field_config(self, cls):
        field_config = {}
        fields = cls.get_editable_fields()
        autopopulate_fields = getattr(cls, 'autopopulate_fields', {})
        for field in fields:
            field_config[field.name] = {
                'type': '{}.{}'.format(
                    field.__module__,
                    field.__class__.__name__
                ),
                'title_field': field.name == getattr(cls, 'admin_title_field', None),
            }

            if field.name in autopopulate_fields:
                field_config[field.name]['autopopulate'] = autopopulate_fields[field.name]

            for att in [
                'name', 'verbose_name', 'verbose_name_plural', 'max_length', 'blank'
            ]:
                field_config[field.name][att] = getattr(field, att, None)

            if isinstance(field, (ForeignKey, ManyToManyField)):
                if issubclass(field.related_model, Node):
                    field_config[field.name][
                        'related_node_type'] = field.related_model.type()
                field_config[field.name]['related_model'] = '{}.{}'.format(
                    field.related_model.__module__, field.related_model.__name__)

            extra_config = getattr(field, 'get_extra_config', None)
            if callable(extra_config):
                field_config[field.name].update(extra_config())
            
        return field_config
