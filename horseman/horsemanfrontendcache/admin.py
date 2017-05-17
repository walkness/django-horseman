from django.contrib import admin

from . import models


@admin.register(models.Invalidation)
class InvalidationAdmin(admin.ModelAdmin):
    list_display = [
        'created_at', 'completed_at', 'cache_name', 'invalidated_objects', 'num_paths', 'status'
    ]
    list_filter = ['cache_name', 'status']
    ordering = ['-created_at']
    actions = ['update_status']
    readonly_fields = [
        'created_at', 'completed_at', 'cache_name', 'backend', 'backend_details', 'paths'
    ]

    def num_paths(self, obj):
        return len(obj.paths)
    num_paths.short_description = 'Number of paths'

    def invalidated_objects(self, obj):
        invalidated_objects = obj.invalidated_objects()
        return ', <br />'.join([
            '{}: {}'.format(obj._meta.verbose_name.title(), obj)
            for obj in invalidated_objects
        ])
    invalidated_objects.allow_tags = True

    def update_status(self, request, queryset):
        queryset.update_status()


@admin.register(models.InvalidationObject)
class InvalidationObjectAdmin(admin.ModelAdmin):
    list_display = ['item', 'invalidation']
    readonly_fields = ['invalidation', 'content_type', 'object_id']
