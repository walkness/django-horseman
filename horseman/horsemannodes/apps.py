from django.apps import AppConfig


class NodesConfig(AppConfig):
    name = 'horseman.horsemannodes'
    label = 'horsemannodes'
    verbose_name = 'Horseman nodes'

    def ready(self):
        from .signal_handlers import register_signal_handlers
        register_signal_handlers()
