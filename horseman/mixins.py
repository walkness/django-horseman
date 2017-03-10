from django.apps import apps


class AdminModelMixin(object):

    @classmethod
    def get_all_types(cls):
        return cls.__subclasses__()

    @classmethod
    def type(cls):
        return '{}.{}'.format(cls._meta.app_label, cls.__name__)

    @classmethod
    def num(cls):
        return cls.objects.count()

    @classmethod
    def get_editable_fields(cls):
        fields = []
        for field in cls._meta.get_fields():
            if field.editable and not field.auto_created:
                fields.append(field)
        return fields

    @classmethod
    def get_class_from_type(cls, node_type):
        app_label, model_name = node_type.split('.')
        return apps.get_model(app_label=app_label, model_name=model_name)
