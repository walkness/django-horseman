import os
import re
from django import template
from django.conf import settings
from django.contrib.staticfiles.storage import staticfiles_storage

from webpack_loader.loader import WebpackLoader
from webpack_loader.templatetags.webpack_loader import filter_by_extension, render_as_tags

register = template.Library()

class HorsemanAdminWebpackLoader(WebpackLoader):
    def __init__(self):
        self.name = 'DEFAULT'

        is_frontend_dev = getattr(settings, 'HORSEMANADMIN_FRONTEND_DEV', False)

        stats_dir = 'frontend' if is_frontend_dev else os.path.join('static', 'horsemanadmin')

        base_config = {
            'CACHE': not is_frontend_dev,
            'BUNDLE_DIR_NAME': 'webpack_bundles/', # must end with slash
            'STATS_FILE': os.path.join(os.path.dirname(os.path.dirname(__file__)), stats_dir, 'webpack-stats.json'),
            'POLL_INTERVAL': 0.1,
            'TIMEOUT': None,
            'IGNORE': ['.+\.hot-update.js', '.+\.map']
        }
        base_config['ignores'] = [re.compile(I) for I in base_config['IGNORE']]
        self.config = base_config

    def get_chunk_url(self, chunk):
        url = super().get_chunk_url(chunk)
        if url.startswith('/static/horsemanadmin/'):
            return staticfiles_storage.url(url[len('/static/'):])
        return url

@register.simple_tag
def render_bundle(bundle_name, extension=None):
    loader = HorsemanAdminWebpackLoader()
    bundle = loader.get_bundle(bundle_name)

    if extension:
        bundle = filter_by_extension(bundle, extension)

    return render_as_tags(bundle, '')
