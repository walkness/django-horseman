from pprint import pprint

from django.contrib import admin, messages
from django.urls import reverse
from django.db.models import Count, Q

from horseman.utils import get_object_admin_url, convert_null_string

from . import models


class TimezoneFilter(admin.SimpleListFilter):
    title = 'timezone'
    parameter_name = 'timezone'

    def lookups(self, request, model_admin):
        tzs = models.Image.objects.all().values_list('captured_at_tz', flat=True).order_by(
            'captured_at_tz').distinct()
        lookups = []
        for tz in tzs:
            if tz:
                name = str(tz).replace('_', ' ').replace('/', ' / ')
                lookups.append((tz, name))
            else:
                lookups.append(('none', 'None'))
        return lookups

    def queryset(self, request, queryset):
        value = self.value()
        if value:
            value = convert_null_string(value)
            if value:
                queryset = queryset.filter(captured_at_tz=value)
            else:
                queryset = queryset.filter(Q(captured_at_tz='') | Q(captured_at_tz=None))
        return queryset


@admin.register(models.Image)
class ImageAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'shortened_filename', 'created_at', 'captured_at', 'captured_at_tz',
        'renditions'
    ]
    list_filter = ['mime_type', TimezoneFilter]
    search_fields = ['title', 'original_filename']
    ordering = ['-created_at']
    actions = ['update_timezone']
    fieldsets = (
        (None, {
            'fields': ['title', 'created_at', 'created_by'],
        }),
        ('Image Details', {
            'fields': [
                'file', 'original_filename', 'width', 'height', 'hash', 'filesize',
                'mime_type', 'captured_at', 'captured_at_tz', 'pretty_exif',
            ],
        }),
    )
    readonly_fields = ['original_filename', 'width', 'height', 'hash', 'filesize', 'captured_at', 'pretty_exif']

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

    def update_timezone(self, request, queryset):
        set_timezones = []
        for image in queryset:
            tz = image.update_captured_at_tz_from_gps()
            if tz:
                image.update_capture_time_from_exif()
            image.save()
            if tz:
                set_timezones.append(image.pk)
        if len(set_timezones) > 0:
            self.message_user(
                request,
                'Updated timezones for {} of {} images.'.format(
                    len(set_timezones), len(queryset)),
                messages.SUCCESS,
            )
        else:
            self.message_user(
                request,
                'Unable to update timezones for {} images.'.format(
                    len(queryset)),
                messages.ERROR,
            )

    def pretty_exif(self, obj):
        html = '<table><tbody>'
        for category, items in obj.exif_data.items():
            html += '<tr><th colspan="2"><h3>{}</h3></th></tr>'.format(category)
            for label, value in items.items():
                html += '<tr><td>{}</td><td>{}</td></tr>'.format(label, value)
        html += '</tbody></table>'
        return html
    pretty_exif.allow_tags = True


@admin.register(models.Rendition)
class RenditionAdmin(admin.ModelAdmin):
    list_display = ['image', 'width', 'height', 'crop', 'created_at']
    list_filter = ['target_width', 'target_height', 'crop', 'mime_type']
    search_fields = ['image__title', 'image__original_filename']
    ordering = ['-image__created_at', 'width', 'height', 'crop']
