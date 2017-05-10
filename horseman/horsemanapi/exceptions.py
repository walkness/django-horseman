from django.http import Http404
from django.core.exceptions import PermissionDenied

from rest_framework import exceptions, status
from rest_framework.compat import set_rollback
from rest_framework.response import Response

from horseman.horsemanimages.serializers import DuplicateImageError


def exception_handler(exc, context):
    data = {'status_code': 400, 'field_errors': {}, 'non_field_errors': []}

    if isinstance(exc, exceptions.APIException):
        data['status_code'] = exc.status_code

        headers = {}
        if getattr(exc, 'auth_header', None):
            headers['WWW-Authenticate'] = exc.auth_header
        if getattr(exc, 'wait', None):
            headers['Retry-After'] = '%d' % exc.wait

        if isinstance(exc, exceptions.ValidationError) and isinstance(exc.detail, dict):
            full_details = exc.get_full_details()
            non_field_errors = full_details.pop('non_field_errors', [])
            data['field_errors'] = full_details
            data['non_field_errors'] = non_field_errors

        elif isinstance(exc, DuplicateImageError):
            data['non_field_errors'] = [exc.get_full_details()]

        elif isinstance(exc.detail, (list, dict)):
            data['non_field_errors'] = exc.detail

        else:
            data['non_field_errors'] = [exc.get_full_details()]

        set_rollback()
        return Response(data, status=exc.status_code, headers=headers)

    elif isinstance(exc, Http404):
        return exception_handler(exceptions.NotFound(), context)

    elif isinstance(exc, PermissionDenied):
        return exception_handler(exceptions.PermissionDenied(), context)

    return None
