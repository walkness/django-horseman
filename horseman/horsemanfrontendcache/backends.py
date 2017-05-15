import sys
import copy
import boto3
from datetime import datetime

from . import models


class BaseBackend(object):

    def __init__(self, name, **kwargs):
        super(BaseBackend, self).__init__()
        self.name = name
        self.invalidation_model = None

    @classmethod
    def get_backend_name(cls):
        return '{module}.{class_name}'.format(
            module=cls.__module__, class_name=cls.__name__)

    def get_invalidation_model(self, pk=None):
        if self.invalidation_model is None:
            if pk:
                self.invalidation_model = models.Invalidation.objects.get(pk=pk)
            else:
                self.invalidation_model = models.Invalidation()
            self.invalidation_model.cache_name = self.name
            self.invalidation_model.backend = self.get_backend_name()
        return self.invalidation_model

    def create_invalidation_objects(self, objects):
        objs = []
        for obj in objects:
            objs.append(models.InvalidationObject(
                invalidation=self.get_invalidation_model(),
                item=obj,
            ))
        return models.InvalidationObject.objects.bulk_create(objs)
    
    def perform_invalidation(self, paths, objects=None):
        raise NotImplementedError

    def update_status(self, invalidation_model):
        raise NotImplementedError


class CloudFrontBackend(BaseBackend):
    status_map = {
        'InProgress': 'in_progress',
        'Completed': 'completed',
    }

    def __init__(self, name, DISTRIBUTION_ID, **kwargs):
        super(CloudFrontBackend, self).__init__(name, **kwargs)
        self.distribution_id = DISTRIBUTION_ID

    def get_client(self):
        if not hasattr(self, '_client'):
            self._client = boto3.client('cloudfront')
        return self._client

    def get_status_from_response(self, response):
        status = None
        if 'Invalidation' in response and 'Status' in response['Invalidation']:
            status = self.status_map.get(response['Invalidation']['Status'], None)
        return status or 'other'

    def get_invalidation_id_from_response(self, response):
        if 'Invalidation' in response:
            return response['Invalidation'].get('Id', None)

    def perform_invalidation(self, paths, objects=None):
        client = self.get_client()
        obj = self.get_invalidation_model()
        obj.paths = paths

        try:
            response = client.create_invalidation(
                DistributionId=self.distribution_id,
                InvalidationBatch={
                    'Paths': {
                        'Quantity': len(paths),
                        'Items': paths,
                    },
                    'CallerReference': str(obj.pk),
                },
            )
        except:
            obj.status = 'error'
            obj.backend_details = {'exception': str(sys.exc_info()[0])}
        else:
            backend_details = copy.deepcopy(response)

            if (
                'Invalidation' in backend_details and
                'CreateTime' in backend_details['Invalidation']
            ):
                create_time = backend_details['Invalidation']['CreateTime']
                if isinstance(create_time, datetime):
                    backend_details['Invalidation']['CreateTime'] = create_time.isoformat()

            obj.status = self.get_status_from_response(response)
            obj.backend_details = backend_details

        obj.save()
        if objects:
            self.create_invalidation_objects(objects)

    def update_status(self, invalidation_model):
        client = self.get_client()
        invalidation_id = self.get_invalidation_id_from_response(invalidation_model.backend_details)
        response = client.get_invalidation(
            DistributionId=self.distribution_id,
            Id=invalidation_id,
        )
        invalidation_model.status = self.get_status_from_response(response)
        invalidation_model.save(update_fields=['status'])
        return invalidation_model


class ConsoleBackend(BaseBackend):

    def perform_invalidation(self, paths, objects=None):
        print('\nInvalidating paths for cache "{name}":\n{paths}\n'.format(
            paths='\n'.join(paths), name=self.name))
        obj = self.get_invalidation_model()
        obj.paths = paths
        obj.status = 'completed'
        obj.save()
        if objects:
            self.create_invalidation_objects(objects)
