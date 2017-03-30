from django.conf import settings


def get_caches():
    return getattr(settings, 'FRONTEND_CACHE', {})


def invalidate_node(node):
    for name, cache in get_caches().items():
        paths = []
        if name == 'default' or cache.get('USE_DEFAULT_PATHS', True):
            paths = node.get_cached_paths()
        else:
            get_cached_paths = getattr(node, 'get_cached_{}_paths'.format(name), None)
            if callable(get_cached_paths):
                paths = get_cached_paths()

        print(list(paths))
