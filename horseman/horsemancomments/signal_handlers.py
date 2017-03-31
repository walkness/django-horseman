from django.db.models.signals import pre_save, m2m_changed

from horseman.signal_handlers import (
    handle_pre_save, handle_m2m_changed
)

from . import models


def register_signal_handlers():
    for node_type in models.Comment.get_all_types():
        pre_save.connect(handle_pre_save, sender=node_type)
        m2m_fields = [field for field in node_type._meta.get_fields() if field.many_to_many]
        for field in m2m_fields:
            m2m_changed.connect(
                handle_m2m_changed,
                sender=getattr(node_type, field.name).through,
            )
