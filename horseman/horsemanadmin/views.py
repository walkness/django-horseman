from django.shortcuts import render as base_render
from django.contrib.auth.decorators import login_required

from rest_framework.renderers import JSONRenderer

from horseman.horsemannodes.models import Node
from horseman.horsemanusers import get_user_serializer
from horseman.horsemancomments.models import Comment

from . import serializers


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


@login_required
def default(request, *args, **kwargs):
    node_configuration = serializers.AdminModelConfigurationSerializer(
        Node.get_all_types(), many=True).data
    comment_configuration = serializers.AdminModelConfigurationSerializer(
        Comment.get_all_types(), many=True).data
    return render(request, {'nodes': node_configuration, 'comments': comment_configuration})
