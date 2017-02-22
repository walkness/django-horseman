from .. import settings


def get_user_serializer():
    serializer_path = settings.USER_SERIALIZER
    components = serializer_path.split('.')
    classname = components.pop(len(components) - 1)
    mod = __import__('.'.join(components), fromlist=[classname])
    return getattr(mod, classname)
