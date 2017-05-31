from django.contrib import admin
from django.urls import reverse
from django.db.models import Count

from horseman.utils import get_object_admin_url

from . import models


@admin.register(models.Image)
class ImageAdmin(admin.ModelAdmin):
    list_display = ['title', 'shortened_filename', 'created_at', 'captured_at', 'renditions']
    list_filter = ['mime_type']
    search_fields = ['title', 'original_filename']
    ordering = ['-created_at']

    def get_queryset(self, request):
        queryset = super(ImageAdmin, self).get_queryset(request)
        queryset = queryset.annotate(num_renditions=Count('renditions'))
        return queryset

    def shortened_filename(self, obj):
        return '<a href="{url}">{name}</a>'.format(
            url=obj.file.url,
            name=obj.original_filename,
        )
    shortened_filename.allow_tags = True
    shortened_filename.short_description = 'File'

    def renditions(self, obj):
        rendition_model = models.Rendition
        return '{num_renditions} (<a href="{url}?image={image}">View</a>)'.format(
            num_renditions=obj.num_renditions,
            url=reverse('admin:{app}_{model}_changelist'.format(
                app=rendition_model._meta.app_label,
                model=rendition_model._meta.model_name,
            )),
            image=obj.pk,
        )
    renditions.allow_tags = True


@admin.register(models.Rendition)
class RenditionAdmin(admin.ModelAdmin):
    list_display = ['image', 'width', 'height', 'crop']
    list_filter = ['target_width', 'target_height', 'crop', 'mime_type']
    search_fields = ['image__title', 'image__original_filename']
    ordering = ['-image__created_at', 'width', 'height', 'crop']
