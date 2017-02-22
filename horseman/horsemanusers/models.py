import hashlib
from urllib.parse import urlencode, quote_plus


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
