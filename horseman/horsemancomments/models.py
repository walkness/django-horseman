import uuid

from django.db import models
from django.apps import apps
from django.conf import settings
from django.utils import timezone

import markdown
from mptt.models import MPTTModel, TreeForeignKey
from markupfield.fields import MarkupField

from horseman.mixins import AdminModelMixin


def linkify_callback(attrs, new=False):
    href = attrs['href']
    if not href.startswith('mailto:') and not href.startswith('tel:'):
        attrs['target'] = '_blank'
    return attrs


def custom_markdown(markup):
    return markdown.markdown(
        markup,
        extensions=['markdown.extensions.nl2br', 'linkify'],
        extension_configs={
            'linkify': {'linkify_callbacks': [linkify_callback]}})


MARKUP_CHOICES = (
    ('markdown', custom_markdown, 'Markdown'),
)


class BaseComment(AdminModelMixin, MPTTModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    parent = TreeForeignKey(
        'self', null=True, blank=True, related_name='children', db_index=True)

    class Meta:
        abstract = True


class Comment(BaseComment):
    created_at = models.DateTimeField(default=timezone.now)
    email = models.EmailField(blank=True, null=True)
    url = models.URLField(blank=True, null=True)
    ip_address = models.GenericIPAddressField(blank=True, null=True, editable=False)
    user_agent = models.TextField(blank=True, null=True, editable=False)
    name = models.CharField(max_length=50, blank=True, null=True)
    body = MarkupField(markup_type='markdown', markup_choices=MARKUP_CHOICES)
    approved = models.BooleanField(default=False)
    approved_at = models.DateTimeField(null=True, blank=True, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, blank=True, null=True)

    api_fields = [
        'created_at', 'email', 'url', 'ip_address', 'user_agent', 'name', 'body', 'approved',
        'approved_at', 'user', 'author',
    ]
    admin_fields = ['body', 'approved']
    admin_order = 0

    @property
    def author(self):
        if self.user:
            return {
                'name': self.user.display_name,
                'url': self.user.website,
            }
        return {att:getattr(self, att) for att in ['name', 'url']}
