from django.db.models import TextField
from django.forms import fields, widgets
from django.contrib.postgres.fields import JSONField
from django.core.exceptions import ValidationError

from rest_framework.serializers import ListField


class RichTextField(TextField):
    pass


class StructuredField(JSONField):
    
    def __init__(self, blocks, *args, **kwargs):
        self.blocks = blocks
        super(StructuredField, self).__init__(*args, **kwargs)

    def deconstruct(self):
        name, path, args, kwargs = super(StructuredField, self).deconstruct()
        args.insert(0, self.blocks)
        return name, path, args, kwargs

    def get_block_instance(self, block_class):
        for block in self.blocks:
            if block.__class__ == block_class:
                return block
        return None

    def get_block_instance_with_name(self, name):
        for block in self.blocks:
            if block.name == name:
                return block
        return None

    def clean(self, data, model):
        if not super(StructuredField, self).clean(data, model):
            return False
        if not isinstance(data, list):
            raise ValidationError('Data must be a list.')
        for block in data:
            block_type = block.get('type', None)
            if not block_type:
                raise ValidationError('Each block must have a type.')
            block_class = self.get_block_instance_with_name(block_type)
            if not block_class:
                raise ValidationError('Invalid block type: "{}"'.format(block_type))
            if not block_class.is_valid(block):
                return False
        return data

    def get_image_ids(self, data):
        ids = []
        for block in data:
            block_class = self.get_block_instance_with_name(block.get('type', None))
            ids.extend(block_class.get_image_ids(block))
        return ids

    def get_extra_serializer_fields(self):
        extra_fields = {
            'body_images': ListField(),
        }
        return extra_fields.items()

    def get_extra_config(self):
        blocks = []
        for block in self.blocks:
            block_fields = block.get_field_config()

            blocks.append({
                'type': block.name,
                'verbose_name': getattr(block, 'verbose_name', block.name),
                'fields': block_fields,
            })

        return {'blocks': blocks}
