import uuid

from django.db import models, connection
from django.conf import settings as django_settings
from django.apps import apps
from django.utils import timezone
from django.contrib.postgres.fields import JSONField

from horseman import settings, mixins
from horseman.horsemanimages.models import Image


class NodeQuerySet(models.QuerySet):

    def prefetch_related_images(self):
        all_ids = []
        all_renditions = {}
        for obj in self:
            ids, renditions = obj.get_related_image_ids()
            all_ids.extend(ids)
            if renditions:
                all_renditions[obj.pk] = renditions
        images = {}
        for image in Image.objects.prefetch_related('renditions').filter(pk__in=all_ids):
            images[image.pk] = image
        for obj in self:
            obj.prefetched_related_images = images
        return self


class NodeManager(models.Manager):

    def get_queryset(self):
        return NodeQuerySet(self.model, using=self._db)

    def prefetch_related_images(self):
        return self.get_queryset().prefetch_related_images()


class AbstractNode(mixins.AdminModelMixin, models.Model):
    if settings.USE_UUID_KEYS:
        id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    created_at = models.DateTimeField(default=timezone.now, editable=False)
    published_at = models.DateTimeField(null=True, editable=False)
    modified_at = models.DateTimeField(default=timezone.now, editable=False)

    created_by = models.ForeignKey(
        django_settings.AUTH_USER_MODEL, related_name='created_nodes')
    published_by = models.ForeignKey(
        django_settings.AUTH_USER_MODEL, related_name='published_nodes',
        null=True, blank=True)

    slug = models.SlugField()
    url_path = models.TextField(editable=False)

    published = models.BooleanField(default=False)

    objects = NodeManager()

    admin_fields = []
    admin_title_field = None
    api_fields = ['pk', 'type', 'created_at', 'published_at', 'modified_at', 'slug', 'published']
    search_fields = ['slug']

    class Meta:
        abstract = True

    def __str__(self):
        return self.slug

    def save(self, *args, **kwargs):
        self.url_path = self.get_url_path()
        super(AbstractNode, self).save(*args, **kwargs)

    def get_url_path(self):
        raise NotImplementedError

    @property
    def title_display(self):
        return self.slug

    def get_title(self):
        return self.slug


class Node(AbstractNode):

    @classmethod
    def update_url_paths(cls):
        for node_type in cls.get_all_types():
            for obj in node_type.objects.all():
                obj.url_path = obj.get_url_path()
                obj.save(update_fields=['url_path'])

    def get_related_image_ids(self):
        ids = []
        renditions = {}
        for field in self._meta.get_fields():
            get_image_ids = getattr(field, 'get_image_ids', None)
            if callable(get_image_ids):
                field_ids, field_renditions = get_image_ids(getattr(self, field.name))
                ids.extend(field_ids)
                for image_id, new_sizes in field_renditions.items():
                    sizes = renditions.get(image_id, [])
                    sizes.extend(new_sizes)
                    renditions[image_id] = sizes
            elif isinstance(field, models.ForeignKey) and issubclass(field.related_model, Image):
                ids.append(getattr(self, field.column))
        return ids, renditions

    def get_related_images(self):
        ids, renditions = self.get_related_image_ids()
        if hasattr(self, 'prefetched_related_images'):
            images = [image for pk, image in self.prefetched_related_images.items() if pk in ids]
            return images, renditions
        return Image.objects.prefetch_related('renditions').filter(pk__in=ids), renditions

    def get_related_node_ids(self):
        node_ids = {}
        for field in self._meta.get_fields():
            related_model = getattr(field, 'related_model', None)
            if related_model and issubclass(related_model, Node) and not field.auto_created:
                node_type = related_model.type()
                if node_type not in node_ids:
                    node_ids[node_type] = []
                if field.many_to_one:
                    rel_id = getattr(self, field.attname, None)
                    if rel_id:
                        node_ids[node_type].append(rel_id)
                else:
                    ids = [obj.id for obj in getattr(self, field.name).all()]
                    node_ids[node_type].extend(ids)
        return node_ids


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
