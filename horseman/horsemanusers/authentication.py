from django.contrib.auth import authenticate
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed


class LoginViewAuthentication(BaseAuthentication):

    def authenticate(self, request):
        if 'username' not in request.data or 'password' not in request.data:
            return None
        user = authenticate(
            username=request.data['username'],
            password=request.data['password'])
        if user is None:
            raise AuthenticationFailed('Invalid username or password.')
        return (user, None)
