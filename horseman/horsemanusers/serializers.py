from django.contrib.auth import get_user_model, password_validation

from rest_framework import serializers
from rest_framework.exceptions import ValidationError


class PasswordField(serializers.CharField):

    def __init__(self, *args, **kwargs):
        kwargs['write_only'] = True
        kwargs['style'] = {'input_type': 'password'}
        self.validate_password = kwargs.pop('validate_password', True)
        self.user = kwargs.pop('user', None)
        self.user_from_request = kwargs.pop('get_user_from_request', True)
        super(PasswordField, self).__init__(*args, **kwargs)

    def set_user(self, user):
        self.user = user

    def get_user(self):
        if not self.user and self.user_from_request:
            if self.context:
                request = self.context.get('request')
                if request.user.is_authenticated():
                    self.user = request.user
        return self.user

    def to_internal_value(self, data):
        if self.validate_password:
            password_validation.validate_password(data, user=self.get_user())
        return super(PasswordField, self).to_internal_value(data)


class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = get_user_model()
        fields = ['pk', 'username', 'email', 'first_name', 'last_name', 'gravatar']


class PasswordResetSerializer(serializers.ModelSerializer):
    email = serializers.CharField()

    class Meta:
        model = get_user_model()
        fields = ['email']

    def validate_email(self, value):
        try:
            self.user = get_user_model().objects.with_email(
                value).get(is_active=True)
        except get_user_model().DoesNotExist:
            self.user = None
            raise ValidationError('No account with this email address exists.')
        else:
            return value

    def create(self, validated_data):
        current_site = validated_data.get('current_site')
        use_https = validated_data.get('use_https', False)
        if self.user:
            self.user.send_password_reset_email(
                site=current_site, use_https=use_https)
            return self.user


class PasswordResetConfirmSerializer(serializers.Serializer):
    email = serializers.CharField(read_only=True)
    uidb64 = serializers.RegexField(r'[0-9A-Za-z_\-]+', write_only=True)
    token = serializers.RegexField(
        r'[0-9A-Za-z]{1,13}-[0-9A-Za-z]{1,20}', write_only=True)
    password = PasswordField()

    def validate_uidb64(self, value):
        try:
            self.user = get_user_model().objects.get_from_b64(value)
            self._fields.get('password').set_user(self.user)
        except (TypeError, ValueError, OverflowError,
                get_user_model().DoesNotExist):
            self.user = None
            raise ValidationError('Unable to find user.')

    def validate_token(self, value):
        if self.user:
            if not self.user.check_password_reset_token(value):
                raise ValidationError('Invalid token.')

    def update(self, instance, validated_data):
        password = validated_data.get('password')
        self.user.is_active = True
        self.user.set_password(password)
        self.user.save()
        return self.user


class PasswordChangeSerializer(serializers.ModelSerializer):
    old_password = PasswordField(validate_password=False)
    new_password = PasswordField()

    class Meta:
        model = get_user_model()
        fields = ('old_password', 'new_password')

    def validate_old_password(self, value):
        assert isinstance(self.instance, get_user_model()), \
            'Serializer must be called with a user instance.'
        if not self.instance.check_password(value):
            raise ValidationError('Invalid current password.')
        return value

    def validate_new_password(self, value):
        if self.initial_data.get('old_password') == value:
            raise ValidationError(
                'New password must be different from old password.')
        return value

    def update(self, instance, validated_data):
        instance.set_password(validated_data.get('new_password'))
        instance.save()
        return instance
