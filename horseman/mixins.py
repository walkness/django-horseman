import re

from django.db.models import Q
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


class SearchableMixin(object):
    search_query_param = 's'
    search_fields = []

    def get_search_fields(self):
        return self.search_fields

    def search_queryset(self, qs):
        search = self.request.query_params.get(self.search_query_param, None)
        print(search)
        if search:
            queries = []
            for f in self.get_search_fields():
                kwarg = {}
                kwarg['%s__iregex' % f] = r'(?:^|\s|>)%s' % re.escape(search)
                queries.append(Q(**kwarg))
            if len(queries) > 0:
                query = queries.pop()
                for item in queries:
                    query |= item
                qs = qs.filter(query)
        return qs

    def get_queryset(self):
        qs = super(SearchableMixin, self).get_queryset()
        qs = self.search_queryset(qs)
        return qs


class BoolQueryParamMixin(object):

    def get_query_param_bool(self, name, default=False):
        raw = self.request.query_params.get(name, default)
        if isinstance(raw, bool):
            return raw
        return raw.lower() in ['yes', 'y', 'true', 't', '1']
