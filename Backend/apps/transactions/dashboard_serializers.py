from rest_framework import serializers

from apps.categories.constants import BUDGET_OK, BUDGET_OVER, BUDGET_WARNING

from .serializers import TransactionSerializer

# Serializers (not raw dicts) so money comes out as strings like "25.50".
# DRF's JSON encoder would turn a raw Decimal into a float.
MONEY = {"max_digits": 16, "decimal_places": 2}
PERCENT = {"max_digits": 12, "decimal_places": 1}


class SummarySerializer(serializers.Serializer):
    total_income = serializers.DecimalField(**MONEY)
    total_expenses = serializers.DecimalField(**MONEY)
    balance = serializers.DecimalField(**MONEY)


class CategorySpendingSerializer(serializers.Serializer):
    category_id = serializers.IntegerField()
    name = serializers.CharField()
    emoji = serializers.CharField()
    total = serializers.DecimalField(**MONEY)
    percentage = serializers.DecimalField(**PERCENT)  # share of all expenses


class MonthlyTrendSerializer(serializers.Serializer):
    month = serializers.CharField()  # "YYYY-MM"
    income = serializers.DecimalField(**MONEY)
    expenses = serializers.DecimalField(**MONEY)


class BudgetSerializer(serializers.Serializer):
    category_id = serializers.IntegerField()
    name = serializers.CharField()
    emoji = serializers.CharField()
    limit = serializers.DecimalField(**MONEY)
    spent = serializers.DecimalField(**MONEY)
    percentage = serializers.DecimalField(**PERCENT)  # can be above 100
    status = serializers.ChoiceField(choices=[BUDGET_OK, BUDGET_WARNING, BUDGET_OVER])


class DashboardSerializer(serializers.Serializer):
    month = serializers.CharField()
    summary = SummarySerializer()
    spending_by_category = CategorySpendingSerializer(many=True)
    monthly_trend = MonthlyTrendSerializer(many=True)
    budgets = BudgetSerializer(many=True)
    recent_transactions = TransactionSerializer(many=True)