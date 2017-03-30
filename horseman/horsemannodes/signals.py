from django.dispatch import Signal


node_changed = Signal(providing_args=['old', 'new', 'changed_fields'])

node_m2m_removed = Signal(providing_args=['instance', 'field', 'pk_set'])
node_m2m_added = Signal(providing_args=['instance', 'field', 'pk_set'])

node_save_finished = Signal(providing_args=['instance'])
