from django.apps import AppConfig


class HorsemanCommentsConfig(AppConfig):
    name = 'horseman.horsemancomments'
    label = 'horsemancomments'
    verbose_name = 'Horseman comments'

    def ready(self):
        from .signal_handlers import register_signal_handlers
        register_signal_handlers()
