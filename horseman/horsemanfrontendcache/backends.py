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


class CloudFrontBackend(BaseBackend):

    def __init__(self, name, DISTRIBUTION_ID, **kwargs):
        super(CloudFrontBackend, self).__init__(name, **kwargs)
        self.distribution_id = DISTRIBUTION_ID

    def get_client(self):
        if not hasattr(self, '_client'):
            self._client = boto3.client('cloudfront')
        return self._client
    
    def perform_invalidation(self, paths, objects=None):
        client = self.get_client()
        obj = self.get_invalidation_model()
        obj.paths = paths

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

        backend_details = copy.deepcopy(response)

        if (
            'Invalidation' in backend_details and
            'CreateTime' in backend_details['Invalidation']
        ):
            create_time = backend_details['Invalidation']['CreateTime']
            if isinstance(create_time, datetime):
                backend_details['Invalidation']['CreateTime'] = create_time.isoformat()

        obj.backend_details = backend_details

        obj.save()
        if objects:
            self.create_invalidation_objects(objects)
