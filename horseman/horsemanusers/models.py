import hashlib
from urllib.parse import urlencode, quote_plus

from django.db import models
from django.contrib.auth.models import UserManager
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_text, force_bytes
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode


class HorsemanUserQuerySet(models.QuerySet):

    def with_email(self, email):
        return self.filter(email__iexact=email)

    def get_from_b64(self, b64):
        pk = force_text(urlsafe_base64_decode(b64))
        return self.get(pk=pk)


class HorsemanUserManager(UserManager):

    def get_queryset(self):
        return HorsemanUserQuerySet(self.model, using=self._db)

    def with_email(self, email):
        return self.get_queryset().with_email(email)

    def get_from_b64(self, b64):
        return self.get_queryset().get_from_b64(b64)


class HorsemanUserMixin(object):

    @property
    def gravatar(self):
        return self.get_gravatar_url()

    def get_gravatar_url(self, size=None):
        email_hash = hashlib.md5(self.email.lower().encode('utf-8')).hexdigest()
        options = {}
        if size:
            options['s'] = str(size)
        url = 'https://www.gravatar.com/avatar/{}'.format(email_hash)
        if options:
            url = '{}?{}'.format(urlencode(options, quote_via=quote_plus))
        return url

    def get_b64_uid(self):
        return urlsafe_base64_encode(force_bytes(self.pk))

    def get_password_reset_token(self):
        return default_token_generator.make_token(self)

    def check_password_reset_token(self, token):
        return default_token_generator.check_token(self, token)

    def send_password_reset_email(self, site=None, use_https=False):
        context = {
            'email': self.email,
            'domain': site.domain,
            'site_name': site.name,
            'uid': self.get_b64_uid(),
            'user': self,
            'token': self.get_password_reset_token(),
            'protocol': 'https' if use_https else 'http',
        }
        self.email_user(
            template='password_reset', context=context, site=site,
            use_https=use_https)
