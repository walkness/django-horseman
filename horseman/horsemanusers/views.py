from django.contrib.auth import get_user_model, login, logout

from rest_framework import viewsets, generics
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from . import get_user_serializer, serializers
from .authentication import LoginViewAuthentication


class UserViewSet(viewsets.ModelViewSet):
    model = get_user_model()
    serializer_class = get_user_serializer()
    queryset = get_user_model().objects.all()


class AuthView(APIView):
    permission_classes = (AllowAny, )
    authentication_classes = (LoginViewAuthentication, )
    serializer_class = get_user_serializer()

    def post(self, request, *args, **kwargs):
        """Handle login requests"""
        login(request, request.user)
        return Response(self.serializer_class(request.user).data)

    def delete(self, request, *args, **kwargs):
        """Handle logout requests"""
        logout(request)
        return Response({})


class PasswordResetView(generics.CreateAPIView):
    model = get_user_model()
    serializer_class = serializers.PasswordResetSerializer
    permission_classes = (AllowAny, )
    queryset = get_user_model().objects.all()

    def perform_create(self, serializer):
        return serializer.save(use_https=self.request.is_secure())


class PasswordChangeView(generics.UpdateAPIView):
    model = get_user_model()
    serializer_class = serializers.PasswordChangeSerializer
    queryset = get_user_model().objects.all()
    permission_classes = (AllowAny, )

    def get_serializer_class(self):
        if not self.request.user.is_authenticated() or (
           'uidb64' in self.request.data and
           'token' in self.request.data):
            return serializers.PasswordResetConfirmSerializer
        return serializers.PasswordChangeSerializer

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        response = super(PasswordChangeView, self).update(
            request, *args, **kwargs)
        if request.user.is_authenticated():
            login(request, request.user)
        return response
