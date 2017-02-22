from django.db.models import Field
from django.contrib.postgres.fields import JSONField


class RichTextField(Field):
    pass


class StructuredField(JSONField):
    
    def __init__(self, blocks, *args, **kwargs):
        self.blocks = blocks
        super(StructuredField, self).__init__(*args, **kwargs)

    def deconstruct(self):
        name, path, args, kwargs = super(StructuredField, self).deconstruct()
        args.insert(0, self.blocks)
        return name, path, args, kwargs
