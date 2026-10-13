from rest_framework import serializers

from .models import Category


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = (
            "id",
            "name",
            "emoji",
            "type",
            "monthly_limit",
            "is_archived",
            "created_at",
        )
        read_only_fields = ("id", "created_at")

    def validate_monthly_limit(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError("The limit cannot be negative.")
        return value

    def validate(self, attrs):
        instance = self.instance
        user = self.context["request"].user

        # On PATCH, fall back to the stored values for fields not sent
        name = attrs.get("name", instance.name if instance else None)
        type_ = attrs.get(
            "type", instance.type if instance else Category.Type.EXPENSE
        )
        limit = attrs.get(
            "monthly_limit", instance.monthly_limit if instance else None
        )

        # Case-insensitive uniqueness per user and type ("Food" == "food")
        duplicates = Category.objects.filter(
            user=user, name__iexact=name, type=type_
        )
        if instance:
            duplicates = duplicates.exclude(pk=instance.pk)
        if duplicates.exists():
            raise serializers.ValidationError(
                {"name": "You already have a category with this name and type."}
            )

        if type_ == Category.Type.INCOME and limit is not None:
            raise serializers.ValidationError(
                {"monthly_limit": "Only expense categories can have a monthly limit."}
            )

        # Changing the type would silently flip existing transactions
        # between income and expense.
        if (
            instance
            and type_ != instance.type
            and instance.transactions.exists()
        ):
            raise serializers.ValidationError(
                {"type": "Cannot change the type of a category that has transactions."}
            )

        return attrs


class CategorySummarySerializer(serializers.ModelSerializer):
    """Compact read-only version, embedded in transaction responses."""

    class Meta:
        model = Category
        fields = ("id", "name", "emoji", "type")
        read_only_fields = fields