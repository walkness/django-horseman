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
            rendition = image.renditions.get_with_filter(filter_)
            return { 'created': False, 'rendition': rendition.pk }
        except models.Rendition.DoesNotExist:
            rendition = image.create_rendition(filter_)
            return { 'created': True, 'rendition': rendition.pk }
