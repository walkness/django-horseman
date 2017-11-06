from django.contrib import admin

from . import models


class NodeAdmin(admin.ModelAdmin):
    list_display = ['title', 'url_path', 'published', 'published_at', 'modified_at', 'author']
    list_filter = ['published']
    search_fields = models.Node.search_fields
    ordering = ['-published_at']
    actions = ['publish', 'unpublish', 'invalidate', 'update_url_path']

    def title(self, obj):
        return obj.title_display

    def publish(self, request, queryset):
        queryset.publish(user=request.user)

    def unpublish(self, request, queryset):
        queryset.unpublish()

    def invalidate(self, request, queryset):
        queryset.invalidate()

    def update_url_path(self, request, queryset):
        queryset.update_url_paths()
    update_url_path.short_description = 'Update URL path'

    def save_model(self, request, obj, form, change):
        obj.save(send_save_finished=False)

    def save_related(self, request, form, formsets, change):
        super(NodeAdmin, self).save_related(request, form, formsets, change)
        form.instance.send_save_finished()
