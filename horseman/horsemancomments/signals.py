from django.dispatch import Signal


comment_changed = Signal(providing_args=['old', 'new', 'changed_fields'])

comment_m2m_removed = Signal(providing_args=['instance', 'field', 'pk_set'])
comment_m2m_added = Signal(providing_args=['instance', 'field', 'pk_set'])

comment_save_finished = Signal(providing_args=['instance'])
