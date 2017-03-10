from django.contrib.auth import get_user_model

from rest_framework import viewsets

from . import get_user_serializer


class UserViewSet(viewsets.ModelViewSet):
    model = get_user_model()
    serializer_class = get_user_serializer()
    queryset = get_user_model().objects.all()
