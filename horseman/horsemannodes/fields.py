from django.db.models import TextField, ForeignKey, SET_NULL
from django.contrib.postgres.fields import JSONField
from django.core.exceptions import ValidationError

from rest_framework.serializers import ListField

from horseman.horsemanimages import convert_size_to_renditions
from horseman.horsemanimages.models import Image


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
        renditions = {}
        for block in data:
            block_class = self.get_block_instance_with_name(block.get('type', None))
            new_ids, image_sizes = block_class.get_image_ids(block)
            ids.extend(new_ids)
            for image_id, new_sizes in image_sizes.items():
                sizes = renditions.get(image_id, [])
                sizes.extend(new_sizes)
                renditions[image_id] = sizes
        return ids, renditions

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


class SingleImageField(ForeignKey):
    image_model_class = Image

    def __init__(self, *args, **kwargs):
        self.sizes = kwargs.pop('sizes', None)
        kwargs['to'] = '{}.{}'.format(
            self.image_model_class._meta.app_label,
            self.image_model_class.__name__
        )
        super(SingleImageField, self).__init__(*args, **kwargs)

    def deconstruct(self):
        name, path, args, kwargs = super(SingleImageField, self).deconstruct()
        kwargs['to'] = '{}.{}'.format(
            self.image_model_class._meta.app_label,
            self.image_model_class.__name__
        )
        kwargs['sizes'] = self.sizes
        return name, path, args, kwargs

    def get_renditions(self):
        renditions = []
        for name, size in (self.sizes or {}).items():
            renditions.extend(convert_size_to_renditions(name, size))
        return renditions

    def get_image_ids(self, data):
        image_id = data
        if isinstance(data, self.image_model_class):
            image_id = data.pk
        renditions = {str(image_id): self.get_renditions()}
        return [image_id], renditions
