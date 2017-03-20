import inspect
from django import forms

from .forms import RichTextFormField, ImageSizeField, SingleImageField, MultipleImageField
from horseman.horsemanimages import convert_size_to_renditions
from horseman.horsemanimages.models import Image


class Block(object):

    def deconstruct(self):
        path = '{}.{}'.format(self.__class__.__module__, self.__class__.__name__)
        args = []
        kwargs = {}
        return path, args, kwargs

    def get_fields(self, field_class=forms.Field):
        return inspect.getmembers(
            self,
            lambda v: isinstance(v, field_class)
        )

    def get_image_ids(self, data):
        ids = []
        sizes = {}
        for name, field in self.get_image_fields().items():
            id_attr = data.get(name, [])
            if not isinstance(id_attr, (list, tuple,)):
                id_attr = [id_attr]
            ids.extend(id_attr)

            image_size = None
            if len(getattr(self, 'sizes', {}).keys()) == 1:
                image_size = list(self.sizes.keys())[0]

            size_field_name = getattr(field, 'size_field', None)
            if size_field_name:
                if size_field_name in data:
                    image_size = data[size_field_name]

            if image_size:
                for image_id in ids:
                    sizes[image_id] = convert_size_to_renditions(
                        image_size, self.sizes[image_size])

        return ids, sizes

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
                    'min_length', 'min_value', 'max_value', 'required'
            ]:
                fields[name][att] = getattr(field, att, None)

            get_extra_config = getattr(field, 'get_extra_config', None)
            if callable(get_extra_config):
                fields[name].update(get_extra_config())

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


class ImageBlockMixin(object):

    def __init__(self, *args, **kwargs):
        sizes = kwargs.pop('sizes', None)
        size_options = kwargs.pop('size_options', None)
        super(ImageBlockMixin, self).__init__(*args, **kwargs)
        self.sizes = sizes
        if sizes and size_options is None:
            size_options = list(sizes.keys())
        self.size_options = size_options
        if size_options and len(size_options) > 1:
            self.size = ImageSizeField(
                size_options=[
                    (opt, sizes.get(opt, {}).get('verbose_name', opt.replace('_', ' ')))
                    for opt in size_options
                ]
            )

    def deconstruct(self):
        path, args, kwargs = super(ImageBlockMixin, self).deconstruct()
        kwargs['sizes'] = self.sizes
        kwargs['size_options'] = self.sizes
        return path, args, kwargs


class ImageBlock(ImageBlockMixin, Block):
    name = 'image'

    id = SingleImageField(queryset=Image.objects.all(), size_field='size')


class GalleryBlock(ImageBlockMixin, Block):
    name = 'gallery'

    images = MultipleImageField(queryset=Image.objects.all(), size_field='size')
    columns = forms.IntegerField(min_value=2, max_value=5)
