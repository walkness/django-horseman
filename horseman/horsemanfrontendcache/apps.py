from django.apps import AppConfig


class HorsemanFrontendCacheConfig(AppConfig):
    name = 'horseman.horsemanfrontendcache'
    label = 'horsemanfrontendcache'
    verbose_name = 'Horseman frontend cache'

    def ready(self):
        from .signal_handlers import register_signal_handlers
        register_signal_handlers()
