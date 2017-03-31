from django.conf import settings

from . import backends


def get_caches():
    return getattr(settings, 'FRONTEND_CACHE', {})


def get_item_paths(item):
    all_paths = {}
    for name, cache in get_caches().items():
        paths = []
        if name == 'default' or cache.get('USE_DEFAULT_PATHS', True):
            paths = item.get_cached_paths()
        else:
            get_cached_paths = getattr(item, 'get_cached_{}_paths'.format(name), None)
            if callable(get_cached_paths):
                paths = get_cached_paths()

        all_paths[name] = list(paths)

    return all_paths


def invalidate_paths(paths, objects=None):
    for name, cache in get_caches().items():
        cache_paths = list(paths.get(name, set()))
        if len(cache_paths) > 0:
            backend_class = backends.CloudFrontBackend
            backend = backend_class(name, **cache)
            backend.perform_invalidation(list(cache_paths), objects=objects)


def invalidate_item(item):
    paths = get_item_paths(item)
    invalidate_paths(paths, objects=[item])


def invalidate_items(items):
    all_paths = {}
    for item in items:
        item_paths = get_item_paths(item)
        for name, paths in item_paths.items():
            if name not in all_paths:
                all_paths[name] = set()
            all_paths[name].update(paths)

    invalidate_paths(all_paths, objects=items)
