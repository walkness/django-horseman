from django.db.models.signals import pre_save, post_save, m2m_changed

from horseman.signal_handlers import (
    handle_pre_save, handle_m2m_changed as base_handle_m2m_changed
)

from . import signals, models


def handle_post_save(sender, instance, **kwargs):
    changed_fields = list(getattr(instance, '_changed_fields', set()))
    if len(changed_fields) > 0:
        signals.node_changed.send(
            sender=sender,
            old=getattr(instance, '_old_model', None),
            new=instance,
            changed_fields=changed_fields
        )


def handle_m2m_changed(sender, instance, action=None, pk_set=None, **kwargs):
    field = base_handle_m2m_changed(sender, instance, action=action, pk_set=pk_set, **kwargs)

    signal_kwargs = {
        'sender': instance.__class__,
        'instance': instance,
        'field': field,
        'pk_set': pk_set
    }
    if action == 'post_remove':
        signals.node_m2m_removed.send(**signal_kwargs)
    elif action == 'post_add':
        signals.node_m2m_added.send(**signal_kwargs)
    elif action == 'post_clear':
        signal_kwargs['pk_set'] = getattr(instance, '_m2m_cleared_fields', {}).get(field.name, [])
        signals.node_m2m_removed.send(**signal_kwargs)


def handle_node_changed(new, old, changed_fields=None, **kwargs):
    new.on_changed(old=old, changed_fields=changed_fields)


def handle_node_m2m_added(instance, field, pk_set, **kwargs):
    instance.on_m2m_added(field=field, pk_set=pk_set)


def handle_node_m2m_removed(instance, field, pk_set, **kwargs):
    instance.on_m2m_removed(field=field, pk_set=pk_set)


def register_signal_handlers():
    for node_type in models.Node.get_all_types():
        pre_save.connect(handle_pre_save, sender=node_type)
        post_save.connect(handle_post_save, sender=node_type)
        signals.node_changed.connect(handle_node_changed, sender=node_type)
        signals.node_m2m_added.connect(handle_node_m2m_added, sender=node_type)
        signals.node_m2m_removed.connect(handle_node_m2m_removed, sender=node_type)
        m2m_fields = [field for field in node_type._meta.get_fields() if field.many_to_many]
        for field in m2m_fields:
            sender_model = getattr(node_type, field.name)
            if hasattr(sender_model, 'through'):
                m2m_changed.connect(
                    handle_m2m_changed,
                    sender=sender_model.through,
                )
