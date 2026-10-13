from django.contrib import admin

from .models import Category


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "emoji", "type", "monthly_limit", "is_archived", "user")
    list_filter = ("type", "is_archived")
    search_fields = ("name", "user__email")