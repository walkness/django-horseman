from rest_framework import serializers

from . import models


class NodeSerializer(serializers.ModelSerializer):

    class Meta:
        model = models.Node
        fields = ['pk']



class NodeConfigurationSerializer(serializers.Serializer):
    node_type = serializers.CharField()
    app_label = serializers.CharField(source='_meta.app_label')
    model_name = serializers.CharField(source='_meta.model_name')
    name = serializers.CharField(source='_meta.verbose_name')
    name_plural = serializers.CharField(source='_meta.verbose_name_plural')
    num_nodes = serializers.IntegerField()
    editable_fields = serializers.SerializerMethodField()

    def get_editable_fields(self, cls):
        fields = cls.get_editable_fields()
        return [field.name for field in fields]
