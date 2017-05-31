from django.urls import reverse


def get_object_admin_url(obj, urlconf=None):
    return reverse(
        'admin:{app}_{model}_change'.format(
            app=obj._meta.app_label,
            model=obj._meta.model_name
        ),
        args=(obj.pk, ),
        urlconf=urlconf,
    )
