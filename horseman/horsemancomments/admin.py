from mptt.admin import MPTTModelAdmin


class CommentAdmin(MPTTModelAdmin):
    list_display = [
        'created_at', 'name', 'email', 'approved', 'approved_at', 'spam', 'akismet_spam',
        'ip_address'
    ]
    list_filter = ['approved', 'spam', 'akismet_spam', 'user']
    actions = [
        'approve', 'unapprove', 'mark_as_spam', 'mark_as_not_spam', 'akismet_check',
        'invalidate'
    ]
    search_fields = ['name', 'email', 'url', 'body']

    def approve(self, request, queryset):
        queryset.approve()

    def unapprove(self, request, queryset):
        queryset.unapprove()

    def akismet_check(self, request, queryset):
        for obj in queryset:
            obj.akismet_check(user_agent=request.META.get('HTTP_USER_AGENT', None), save=True)

    def mark_as_spam(self, request, queryset):
        queryset.mark_as_spam(user_agent=request.META.get('HTTP_USER_AGENT', None))

    def mark_as_not_spam(self, request, queryset):
        queryset.mark_as_not_spam(user_agent=request.META.get('HTTP_USER_AGENT', None))

    def invalidate(self, request, queryset):
        queryset.invalidate()
