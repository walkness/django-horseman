import inspect
from django import forms

from .forms import RichTextFormField
from horseman.horsemanimages.models import Image


class Block(object):
    
    def deconstruct(self):
        path = '{}.{}'.format(self.__class__.__module__, self.__class__.__name__)
        args = []
        kwargs = {}
        return path, args, kwargs

    def get_fields(self, field_class=forms.Field):
        return inspect.getmembers(
            self.__class__,
            lambda v: isinstance(v, field_class)
        )

    def get_image_ids(self, data):
        ids = []
        for name, field in self.get_image_fields().items():
            id_attr = data.get(name, [])
            if not isinstance(id_attr, (list, tuple,)):
                id_attr = [id_attr]
            ids.extend(id_attr)
        return ids

    def get_image_fields(self):
        image_fields = {}
        for name, field in self.get_fields(forms.ModelChoiceField):
            queryset = getattr(field, 'queryset', None)
            if queryset and issubclass(queryset.model, Image):
                image_fields[name] = field
        return image_fields

    def get_field_config(self):
        fields = {}
        for name, field in self.get_fields():
            fields[name] = {
                'type': field.__class__.__name__,
                'name': name,
            }
            for att in [
                    'help_text', 'label', 'label_suffix', 'max_length',
                    'min_length', 'required'
            ]:
                fields[name][att] = getattr(field, att, None)
        return fields

    def is_valid(self, data):
        for name, field in self.get_fields():
            if not field.clean(data.get(name, None)):
                return False
        return True

    @classmethod
    def get_block_class_with_name(cls, name):
        for block_class in cls.__subclasses__():
            if block_class.name == name:
                return block_class
        return None


class RichTextBlock(Block):
    name = 'richtext'
    verbose_name = 'rich text'

    value = RichTextFormField()


class ImageBlock(Block):
    name = 'image'

    id = forms.ModelChoiceField(queryset=Image.objects.all())


class GalleryBlock(Block):
    name = 'gallery'

    images = forms.ModelMultipleChoiceField(queryset=Image.objects.all())
