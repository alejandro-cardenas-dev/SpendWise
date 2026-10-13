from django.contrib import admin

from .models import Transaction


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ("date", "category", "amount", "user")
    list_filter = ("category__type",)
    search_fields = ("description", "user__email")
    date_hierarchy = "date"