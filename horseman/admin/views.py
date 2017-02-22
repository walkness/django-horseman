from django.shortcuts import render as base_render

from rest_framework.renderers import JSONRenderer

from horseman.users import get_user_serializer


def render(request, _init_data=None):
    init_data = {'isLoggedIn': False, 'currentUser': None}
    if request.user.is_authenticated():
        init_data['isLoggedIn'] = True
        init_data['currentUser'] = get_user_serializer()(request.user).data
    if isinstance(_init_data, dict):
        init_data.update(_init_data)
    return base_render(
        request,
        'horseman/admin/base.html',
        context={'init_data': JSONRenderer().render(init_data)}
    )


def default(request, *args, **kwargs):
    return render(request)
