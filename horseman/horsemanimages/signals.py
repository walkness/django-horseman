from django.dispatch import Signal


image_file_changed = Signal(providing_args=['instance', 'old_filename', 'new_filename'])
