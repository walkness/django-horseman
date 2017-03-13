import uuid

from django.db import models, connection
from django.conf import settings as django_settings
from django.apps import apps
from django.utils import timezone
from django.contrib.postgres.fields import JSONField

from horseman import settings, mixins
from horseman.horsemanimages.models import Image


def get_object_revision_relation_value(obj):
    if not obj:
        return None

    val = obj.pk
    get_revision_relation_value = getattr(
        obj, 'get_revision_relation_value', None)
    if callable(get_revision_relation_value):
        val = get_revision_relation_value()
    return val


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

    def get_from_revision_relation_value(self, value):
        if isinstance(value, (list, tuple)):
            return self.filter(pk__in=value)
        return self.filter(pk=value)


class NodeManager(models.Manager):

    def get_queryset(self):
        return NodeQuerySet(self.model, using=self._db)

    def prefetch_related_images(self):
        return self.get_queryset().prefetch_related_images()

    def get_from_revision_relation_value(self, value):
        return self.get_queryset().get_from_revision_relation_value(value)


class AbstractNode(mixins.AdminModelMixin, models.Model):
    if settings.USE_UUID_KEYS:
        id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    created_at = models.DateTimeField(default=timezone.now, editable=False)
    published_at = models.DateTimeField(null=True, editable=False)
    modified_at = models.DateTimeField(default=timezone.now, editable=False)

    created_by = models.ForeignKey(
        django_settings.AUTH_USER_MODEL, related_name='created_nodes', editable=False)
    published_by = models.ForeignKey(
        django_settings.AUTH_USER_MODEL, related_name='published_nodes',
        null=True, blank=True, editable=False)
    author = models.ForeignKey(
        django_settings.AUTH_USER_MODEL, related_name='nodes')

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

    def get_revision_relation_value(self):
        return str(self.pk)


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

    def get_revision_fields(self):
        base_fields = ['slug', 'author']
        all_node_fields = Node._meta.get_fields()
        extra_fields = [
            field.name for field in self._meta.get_fields()
            if field not in all_node_fields and field.editable and not field.auto_created
        ]
        return base_fields + extra_fields

    def get_revision_content(self):
        content = {}
        for field_name in self.get_revision_fields():
            field = self._meta.get_field(field_name)
            if field.many_to_one:
                content[field_name] = get_object_revision_relation_value(getattr(self, field_name))
            elif field.many_to_many:
                qs = getattr(self, field_name).all()
                if field.__class__.__name__ == 'TaggableManager':
                    content[field_name] = [obj.name for obj in qs]
                else:
                    content[field_name] = [get_object_revision_relation_value(obj) for obj in qs]
            else:
                content[field_name] = getattr(self, field_name)
        return content

    def create_revision(self, **kwargs):
        return self.revisions.create(content=self.get_revision_content(), **kwargs)

    def as_revision(self, revision):
        for att, value in revision.content_as_internal_value(self.__class__).items():
            setattr(self, att, value)
        return self


class NodeRevision(models.Model):
    if settings.USE_UUID_KEYS:
        id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    node = models.ForeignKey(Node, related_name='revisions')
    created_by = models.ForeignKey(django_settings.AUTH_USER_MODEL)
    created_at = models.DateTimeField(default=timezone.now)
    content = JSONField()

    def content_as_internal_value(self, node_class=Node):
        if not hasattr(self, '_content_internal_value'):
            content = {}
            for att, raw_value in self.content.items():
                field = node_class._meta.get_field(att)
                value = raw_value
                if field.is_relation and field.__class__.__name__ is not 'TaggableManager':
                    get_from_revision_relation_value = getattr(
                        field.related_model.objects, 'get_from_revision_relation_value', None)
                    if callable(get_from_revision_relation_value):
                        value = get_from_revision_relation_value(raw_value)
                    elif field.many_to_one:
                        value = field.related_model.objects.filter(pk=raw_value).first()
                    elif field.many_to_many and isinstance(raw_value, list):
                        value = field.related_model.objects.filter(pk__in=raw_value)
                content[att] = value
            self._content_internal_value = content
        return self._content_internal_value
