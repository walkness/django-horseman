from django.apps import AppConfig


class HorsemanImagesConfig(AppConfig):
    name = 'horseman.horsemanimages'
    label = 'horsemanimages'
    verbose_name = 'Horseman images'

    def ready(self):
        from .signal_handlers import register_signal_handlers
        register_signal_handlers()
