from django.contrib import admin

from .models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ("created_at", "user", "category", "type", "month", "is_read")
    list_filter = ("type", "is_read")
    search_fields = ("user__email", "category__name", "message")