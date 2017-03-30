from django.contrib import admin

from . import models


class NodeAdmin(admin.ModelAdmin):
    list_display = ['title', 'url_path', 'published', 'published_at', 'modified_at', 'author']
    list_filter = ['published']
    search_fields = models.Node.search_fields
    ordering = ['-published_at']
    actions = ['publish', 'unpublish']

    def title(self, obj):
        return self.title_display

    def publish(self, request, queryset):
        queryset.publish(user=request.user)

    def unpublish(self, request, queryset):
        queryset.unpublish()

    def save_related(self, request, form, formsets, change):
        super(NodeAdmin, self).save_related(request, form, formsets, change)
        form.instance.send_save_finished()
