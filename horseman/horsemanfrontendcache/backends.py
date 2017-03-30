


class BaseBackend(object):
    
    def get_invalidated_paths(self):
        raise NotImplementedError


class CloudFrontBackend(BaseBackend):
    pass
