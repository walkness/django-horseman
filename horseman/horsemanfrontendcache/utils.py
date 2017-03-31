from django.conf import settings


def get_caches():
    return getattr(settings, 'FRONTEND_CACHE', {})


def get_item_paths(item, **kwargs):
    all_paths = {}
    for name, cache in get_caches().items():
        paths = []
        if name == 'default' or cache.get('USE_DEFAULT_PATHS', True):
            paths = item.get_cached_paths(**kwargs)
        else:
            get_cached_paths = getattr(item, 'get_cached_{}_paths'.format(name), None)
            if callable(get_cached_paths):
                paths = get_cached_paths(**kwargs)

        all_paths[name] = list(paths)

    return all_paths


def invalidate_paths(paths, objects=None):
    for name, config in get_caches().items():
        cache_paths = list(paths.get(name, set()))
        if len(cache_paths) > 0:
            backend_class = get_backend_from_string(config['BACKEND'])
            backend = backend_class(name, **config)
            backend.perform_invalidation(list(cache_paths), objects=objects)


def invalidate_item(item, **kwargs):
    paths = get_item_paths(item, **kwargs)
    invalidate_paths(paths, objects=[item])


def invalidate_items(items, **kwargs):
    all_paths = {}
    for item in items:
        item_paths = get_item_paths(item, **kwargs)
        for name, paths in item_paths.items():
            if name not in all_paths:
                all_paths[name] = set()
            all_paths[name].update(paths)

    invalidate_paths(all_paths, objects=items)


def get_backend_from_string(string):
    parts = string.split('.')
    name = parts[-1]
    module = __import__('.'.join(parts[:-1]), fromlist=[name])
    return getattr(module, name)


def update_invalidation_status(invalidation):
    backend_class = get_backend_from_string(invalidation.backend)
    caches = get_caches()
    config = caches[invalidation.cache_name]
    backend = backend_class(invalidation.cache_name, **config)
    return backend.update_status(invalidation)
