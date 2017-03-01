from django import forms

from horseman.horsemanimages.models import Image


class RichTextFormField(forms.CharField):
    widget = forms.Textarea


class ImageSizeField(forms.ChoiceField):

    def __init__(self, *args, **kwargs):
        self.size_options = kwargs.pop('size_options', None)
        kwargs['choices'] = self.size_options
        super(ImageSizeField, self).__init__(*args, **kwargs)

    def get_extra_config(self):
        return {'size_options': self.size_options}


class ImageFieldMixin(object):

    def __init__(self, *args, **kwargs):
        self.size_field = kwargs.pop('size_field', None)
        kwargs['queryset'] = Image.objects.all()
        super(ImageFieldMixin, self).__init__(*args, **kwargs)

    def deconstruct(self):
        name, path, args, kwargs = super(ImageFieldMixin, self).deconstruct()
        kwargs['queryset'] = Image.objects.all()
        return name, path, args, kwargs


class SingleImageField(ImageFieldMixin, forms.ModelChoiceField):
    pass    


class MultipleImageField(ImageFieldMixin, forms.ModelMultipleChoiceField):
    pass
