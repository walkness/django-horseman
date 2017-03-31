from django.db.models.signals import pre_save, post_save, m2m_changed

from . import signals, models



def handle_pre_save(sender, instance, **kwargs):
    model_class = instance.__class__
    old = None
    pk = getattr(instance, 'pk', None)
    if pk:
        try:
            old = model_class.objects.get(pk=pk)
        except model_class.DoesNotExist:
            pass
    new = instance

    fields = None
    update_fields = kwargs.get('update_fields', None)
    if update_fields:
        fields = [model_class._meta.get_field(name) for name in update_fields]
    else:
        fields = model_class._meta.get_fields()

    instance._old_model = old
    changed_fields = []
    if fields:
        for field in fields:
            if not (field.many_to_many or field.one_to_many):
                old_value = getattr(old, field.name)
                new_value = getattr(new, field.name)
                if field.name == 'url_path':
                    old_value = old.get_url_path()
                    new_value = new.get_url_path()
                if old_value != new_value:
                    changed_fields.append(field)

    if not hasattr(instance, '_changed_fields'):
        instance._changed_fields = set()

    if len(changed_fields) > 0:
        instance._changed_fields.update([field.name for field in changed_fields])


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
    field = [
        field for field in instance._meta.get_fields()
        if field.many_to_many and field.remote_field.through == sender
    ][0]
    field_name = field.name

    if not hasattr(instance, '_changed_fields'):
        instance._changed_fields = set()

    instance._changed_fields.add(field_name)

    if getattr(instance, '_m2m_cleared_fields', None) is None:
        instance._m2m_cleared_fields = {}

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
    elif action == 'pre_clear':
        instance._m2m_cleared_fields[field_name] = getattr(
            instance, field_name).values_list('pk', flat=True)
    elif action == 'post_clear':
        signal_kwargs['pk_set'] = instance._m2m_cleared_fields.get(field_name, [])
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
            m2m_changed.connect(
                handle_m2m_changed,
                sender=getattr(node_type, field.name).through,
            )
