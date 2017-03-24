try:
    from celery import shared_task
except ImportError:
    pass
else:
    from . import models

    @shared_task
    def create_image_rendition(image_id, filter_dict):
        image = models.Image.objects.get(pk=image_id)
        filter_ = models.Filter(**filter_dict)
        try:
            return image.renditions.get_with_filter(filter_)
        except models.Rendition.DoesNotExist:
            return image.create_rendition(filter_)
