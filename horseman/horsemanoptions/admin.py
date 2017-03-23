from django.contrib import admin

from . import models


@admin.register(models.OptionSet)
class OptionSetAdmin(admin.ModelAdmin):
    prepopulated_fields = {'slug': ('name',)}
    fields = ['name', 'slug']


@admin.register(models.Option)
class OptionAdmin(admin.ModelAdmin):
    list_display = ['key', 'option_set']
    list_filter = ['option_set']
