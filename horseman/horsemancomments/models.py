import uuid

from django.db import models
from django.apps import apps
from django.conf import settings
from django.utils import timezone
from django.utils.formats import localize

import markdown
from mptt.models import MPTTModel, TreeForeignKey
from mptt.managers import TreeManager
from mptt.querysets import TreeQuerySet
from markupfield.fields import MarkupField

from akismet import Akismet

from horseman.mixins import AdminModelMixin
from horseman.horsemanfrontendcache.utils import invalidate_item, invalidate_items


def linkify_callback(attrs, new=False):
    namespace, href = attrs.get('href', (None, ''))
    if not href.startswith('mailto:') and not href.startswith('tel:'):
        attrs[(None, 'target')] = '_blank'
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


class CommentQuerySet(TreeQuerySet):
    
    def public(self):
        return self.filter(approved=True)

    def with_email(self, email):
        return self.filter(email__iexact=email)

    def approve(self):
        self.invalidate(force=True)
        return self.update(approved=True, approved_at=timezone.now())

    def unapprove(self):
        self.invalidate(force=True)
        return self.update(approved=False, approved_at=None)

    def mark_as_spam(self, user_agent=None):
        for obj in self:
            obj.mark_as_spam(user_agent=user_agent)

    def mark_as_not_spam(self, user_agent=None):
        for obj in self:
            obj.mark_as_not_spam(user_agent=user_agent)

    def invalidate(self, force=False):
        invalidate_items(self, force=force)


class CommentManager(TreeManager.from_queryset(CommentQuerySet)):
    pass    


class BaseComment(AdminModelMixin, MPTTModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    parent = TreeForeignKey(
        'self', null=True, blank=True, related_name='children', db_index=True)

    default_manager = CommentManager()

    class Meta:
        abstract = True

    def get_cached_paths(self, **kwargs):
        return
        yield

    def invalidate(self, force=False):
        invalidate_item(self, force=force)


class Comment(BaseComment):
    created_at = models.DateTimeField(default=timezone.now)
    email = models.EmailField(blank=True, null=True)
    url = models.URLField(blank=True, null=True, verbose_name='URL')
    ip_address = models.GenericIPAddressField(
        blank=True, null=True, editable=False, verbose_name='IP address')
    user_agent = models.TextField(blank=True, null=True, editable=False)
    name = models.CharField(max_length=100, blank=True, null=True)
    body = MarkupField(markup_type='markdown', markup_choices=MARKUP_CHOICES)
    approved = models.BooleanField(default=False)
    approved_at = models.DateTimeField(null=True, blank=True, editable=False)
    spam = models.BooleanField(default=False)
    akismet_spam = models.NullBooleanField(default=None, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, blank=True, null=True)

    api_fields = [
        'created_at', 'email', 'url', 'ip_address', 'user_agent', 'name', 'body', 'approved',
        'approved_at', 'user', 'author',
    ]
    admin_fields = ['body', 'approved']
    admin_order = 0

    objects = CommentManager()

    def __str__(self):
        return '{name} on {created_at}'.format(
            name=self.author['name'], created_at=localize(timezone.localtime(self.created_at)))

    @classmethod
    def is_approved_email(cls, email):
        return cls.objects.with_email(email).filter(approved=True).exists()

    @classmethod
    def get_akisment(cls, user_agent=None):
        if not hasattr(cls, '_akismet'):
            cls._akismet = Akismet(
                settings.AKISMET_KEY,
                blog=settings.SITE_URL,
                is_test=getattr(settings, 'AKISMET_DEBUG', settings.DEBUG),
                application_user_agent=user_agent,
            )
        return cls._akismet

    @property
    def author(self):
        if self.user:
            return {
                'name': self.user.display_name,
                'url': self.user.website,
                'user': self.user.pk,
            }
        return {att:getattr(self, att) for att in ['name', 'url']}

    def email_approved(self):
        return Comment.is_approved_email(self.email)

    def auto_approve(self, user_agent=None):
        if self.user:
            self.approved = True
        else:
            self.approved = not self.akismet_check(user_agent=user_agent) and self.email_approved()

        if self.approved:
            self.approved_at = timezone.now()

        return self.approved

    def approve(self, save=True):
        self.approved = True
        self.approved_at = timezone.now()
        if save:
            self.save()

    def unapprove(self, save=True):
        self.approved = False
        self.approved_at = None
        if save:
            self.save()

    def get_akismet_check_kwargs(self):
        return {
            'comment_type': 'comment',
            'comment_author': self.name,
            'comment_author_email': self.email,
            'comment_author_url': self.url,
            'comment_content': self.body.raw,
            'comment_date': self.created_at,
            'blog_lang': settings.LANGUAGE_CODE,
        }

    def akismet_check(self, user_agent=None, save=False):
        if self.ip_address and self.user_agent:
            akismet = Comment.get_akisment(user_agent=user_agent)
            self.akismet_spam = akismet.check(
                self.ip_address, self.user_agent,
                **self.get_akismet_check_kwargs()
            )
            if save:
                self.save()
            return self.akismet_spam
        return None

    def mark_as_spam(self, user_agent=None, save=True):
        self.spam = True
        if self.akismet_spam is False and self.ip_address and self.user_agent:
            akismet = Comment.get_akisment(user_agent=user_agent)
            akismet.submit_spam(self.ip_address, self.user_agent, **self.get_akismet_check_kwargs())
        if save:
            self.save()

    def mark_as_not_spam(self, user_agent=None, save=True):
        self.spam = False
        if self.akismet_spam is True and self.ip_address and self.user_agent:
            akismet = Comment.get_akisment(user_agent=user_agent)
            akismet.submit_ham(self.ip_address, self.user_agent, **self.get_akismet_check_kwargs())
        if save:
            self.save()
