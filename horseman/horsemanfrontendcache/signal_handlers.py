from django.db.models.signals import post_save

from horseman.horsemannodes.models import Node
from horseman.horsemannodes.signals import node_save_finished

from horseman.horsemancomments.models import Comment

from horseman.horsemanimages.models import Image

from .utils import invalidate_item


def handle_node_save_finished(instance, **kwargs):
    changed_fields = list(getattr(instance, '_changed_fields', set()))
    if len(changed_fields) > 0:
        invalidate_item(instance)

def handle_comment_post_save(instance, **kwargs):
    changed_fields = list(getattr(instance, '_changed_fields', set()))
    if len(changed_fields) > 0:
        invalidate_item(instance)


def handle_image_post_save(instance, **kwargs):
    invalidate_caches = getattr(instance, '_invalidate_caches', True)
    changed_fields = list(getattr(instance, '_changed_fields', set()))
    if invalidate_caches and len(changed_fields) > 0:
        invalidate_item(instance)


def register_signal_handlers():
    for node_type in Node.get_all_types():
        node_save_finished.connect(handle_node_save_finished, sender=node_type)
    for comment_type in Comment.get_all_types():
        post_save.connect(handle_comment_post_save, sender=comment_type)
    post_save.connect(handle_image_post_save, sender=Image)
