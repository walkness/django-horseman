from django.db.models.signals import pre_save, post_save, m2m_changed
from django.contrib.contenttypes.fields import GenericRelation

from horseman.horsemannodes.models import Node
from horseman.horsemannodes.signals import node_save_finished

from .utils import invalidate_node


def handle_node_save_finished(instance, **kwargs):
    changed_fields = list(getattr(instance, '_changed_fields', set()))
    if len(changed_fields) > 0:
        invalidate_node(instance)


def register_signal_handlers():
    for node_type in Node.get_all_types():
        node_save_finished.connect(handle_node_save_finished, sender=node_type)
