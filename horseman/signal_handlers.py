

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
                old_value = getattr(old, field.name, None)
                new_value = getattr(new, field.name)
                if field.name == 'url_path':
                    if old:
                        old_value = old.get_url_path()
                    new_value = new.get_url_path()
                if old_value != new_value:
                    changed_fields.append(field)

    if not hasattr(instance, '_changed_fields'):
        instance._changed_fields = set()

    if len(changed_fields) > 0:
        instance._changed_fields.update([field.name for field in changed_fields])


def handle_m2m_changed(sender, instance, action=None, **kwargs):
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

    if action == 'pre_clear':
        instance._m2m_cleared_fields[field_name] = getattr(
            instance, field_name).values_list('pk', flat=True)

    return field
