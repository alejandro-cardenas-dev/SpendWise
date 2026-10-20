from rest_framework import serializers

from apps.categories.serializers import CategorySummarySerializer

from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    category = CategorySummarySerializer(read_only=True)

    class Meta:
        model = Notification
        fields = ("id", "category", "type", "message", "month", "is_read", "created_at")
        read_only_fields = fields