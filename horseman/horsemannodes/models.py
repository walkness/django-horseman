import uuid

from django.db import models, connection
from django.conf import settings as django_settings
from django.utils import timezone
from django.contrib.postgres.fields import JSONField

from horseman import settings


class AbstractNode(models.Model):
    if settings.USE_UUID_KEYS:
        id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    created_at = models.DateTimeField(default=timezone.now, editable=False)
    published_at = models.DateTimeField(null=True, editable=False)
    modified_at = models.DateTimeField(default=timezone.now, editable=False)

    slug = models.SlugField()
    url_path = models.TextField(editable=False)

    published = models.BooleanField(default=False)

    class Meta:
        abstract = True

    def get_url_path(self):
        raise NotImplementedError


class Node(AbstractNode):
    
    @classmethod
    def get_all_node_types(cls):
        return cls.__subclasses__()

    @classmethod
    def node_type(cls):
        return '{}.{}'.format(cls._meta.app_label, cls.__name__)

    @classmethod
    def num_nodes(cls):
        return cls.objects.count()

    @classmethod
    def get_editable_fields(cls):
        fields = []
        for field in cls._meta.get_fields():
            if field.editable:
                fields.append(field)
        return fields


class NodeRevision(models.Model):
    if settings.USE_UUID_KEYS:
        id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    node = models.ForeignKey(Node)
    user = models.ForeignKey(django_settings.AUTH_USER_MODEL)
    created_at = models.DateTimeField(default=timezone.now)

    if connection.vendor == 'postgresql':
        content = JSONField()
    else:
        content = models.TextField()
