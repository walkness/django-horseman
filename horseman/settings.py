from django.conf import settings

USE_UUID_KEYS = getattr(settings, 'USE_UUID_KEYS', True)

USER_SERIALIZER = getattr(settings, 'USER_SERIALIZER', 'horseman.users.serializers.UserSerializer')
