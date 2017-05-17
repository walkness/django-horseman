import uuid

from django.db import models
from django.utils import timezone
from django.contrib.postgres.fields import ArrayField, JSONField
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.utils.formats import localize

from .utils import update_invalidation_status


class InvalidationQuerySet(models.QuerySet):

    def invalidated_objects(self):
        invalidation_objects = InvalidationObject.objects.filter(invalidation__in=self)
        content_types = ContentType.objects.filter(
            pk__in=invalidation_objects.values_list('content_type'))
        object_ids = invalidation_objects.values_list('object_id')
        objects = []
        for content_type in content_types:
            model_class = content_type.model_class()
            objects.extend(list(model_class.objects.filter(pk__in=object_ids)))
        return objects

    def update_status(self):
        for obj in self:
            obj.update_status()


class Invalidation(models.Model):
    STATUS_CHOICES = (
        ('in_progress', 'In progress'),
        ('error', 'Error'),
        ('completed', 'Completed'),
        ('other', 'Other'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(default=timezone.now, editable=False)
    completed_at = models.DateTimeField(blank=True, null=True, editable=False)
    cache_name = models.CharField(max_length=50, editable=False)
    backend = models.CharField(max_length=255, editable=False)
    backend_details = JSONField(blank=True, null=True, editable=False)
    paths = ArrayField(models.CharField(max_length=4000), editable=False)
    status = models.CharField(max_length=11, choices=STATUS_CHOICES, default=STATUS_CHOICES[0][0])

    objects = InvalidationQuerySet.as_manager()

    def __str__(self):
        return '{cache_name} invalidation started on {created_at}'.format(
            cache_name=self.cache_name, created_at=localize(timezone.localtime(self.created_at)))

    def invalidated_objects(self):
        return Invalidation.objects.filter(pk=self.pk).invalidated_objects()

    def update_status(self):
        return update_invalidation_status(self)


class InvalidationObject(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    invalidation = models.ForeignKey(Invalidation, on_delete=models.CASCADE, editable=False)
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, editable=False)
    object_id = models.UUIDField(editable=False)
    item = GenericForeignKey('content_type', 'object_id')

    def __str__(self):
        return str(self.item)
