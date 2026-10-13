from rest_framework import serializers

from apps.categories.models import Category
from apps.categories.serializers import CategorySummarySerializer

from .models import Transaction


class UserCategoryField(serializers.PrimaryKeyRelatedField):
    """Only accepts categories that belong to the requesting user.

    A foreign category gets the same "does not exist" error as a made-up id,
    so the API never confirms that another user's category exists.
    """

    def get_queryset(self):
        request = self.context.get("request")
        if request is None or not request.user.is_authenticated:
            return Category.objects.none()
        return Category.objects.filter(user=request.user)


class TransactionSerializer(serializers.ModelSerializer):
    category = UserCategoryField()
    category_detail = CategorySummarySerializer(source="category", read_only=True)
    type = serializers.CharField(source="category.type", read_only=True)

    class Meta:
        model = Transaction
        fields = (
            "id",
            "amount",
            "category",
            "category_detail",
            "type",
            "date",
            "description",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than zero.")
        return value

    def validate_category(self, category):
        # Block new activity in archived categories, but let people edit
        # old transactions that already live in one.
        is_same_category = (
            self.instance is not None and self.instance.category_id == category.id
        )
        if category.is_archived and not is_same_category:
            raise serializers.ValidationError("This category is archived.")
        return category