from django.contrib import admin

from . import models


@admin.register(models.Invalidation)
class InvalidationAdmin(admin.ModelAdmin):
    list_display = ['created_at', 'completed_at', 'cache_name', 'invalidated_objects', 'num_paths']
    list_filter = ['cache_name']

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


@admin.register(models.InvalidationObject)
class InvalidationObjectAdmin(admin.ModelAdmin):
    list_display = ['item', 'invalidation']
