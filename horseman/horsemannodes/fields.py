from django.db.models import TextField
from django.contrib.postgres.fields import JSONField


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

    def get_extra_config(self):
        blocks = []
        for block in self.blocks:
            blocks.append({
                'type': block.name,
                'verbose_name': getattr(block, 'verbose_name', block.name),
            })
        return {'blocks': blocks}
