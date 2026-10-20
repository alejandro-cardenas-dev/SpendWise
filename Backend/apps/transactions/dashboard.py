"""Dashboard queries. Every function takes the user explicitly and the
database does the maths (Sum, annotate, TruncMonth), not Python loops."""

from decimal import ROUND_HALF_UP, Decimal

from django.db.models import Q, Sum
from django.db.models.functions import TruncMonth

from apps.categories.models import Category
from apps.categories.services import get_budget_status
from apps.common.dates import add_months, format_month, next_month

from .models import Transaction

TREND_MONTHS = 6
RECENT_LIMIT = 5
ZERO = Decimal("0.00")
INCOME = Category.Type.INCOME
EXPENSE = Category.Type.EXPENSE


def _month_transactions(user, month):
    return Transaction.objects.filter(
        user=user, date__gte=month, date__lt=next_month(month)
    )


def _percentage(part, whole):
    if not whole:
        return Decimal("0.0")
    return (part / whole * 100).quantize(Decimal("0.1"), rounding=ROUND_HALF_UP)


def get_summary(user, month):
    totals = _month_transactions(user, month).aggregate(
        income=Sum("amount", filter=Q(category__type=INCOME)),
        expenses=Sum("amount", filter=Q(category__type=EXPENSE)),
    )
    income = totals["income"] or ZERO
    expenses = totals["expenses"] or ZERO
    return {
        "total_income": income,
        "total_expenses": expenses,
        "balance": income - expenses,
    }


def get_spending_by_category(user, month):
    rows = list(
        _month_transactions(user, month)
        .filter(category__type=EXPENSE)
        .values("category_id", "category__name", "category__emoji")
        .annotate(total=Sum("amount"))
        .order_by("-total")
    )
    grand_total = sum((row["total"] for row in rows), ZERO)
    return [
        {
            "category_id": row["category_id"],
            "name": row["category__name"],
            "emoji": row["category__emoji"],
            "total": row["total"],
            "percentage": _percentage(row["total"], grand_total),
        }
        for row in rows
    ]


def get_monthly_trend(user, month):
    """Income and expenses for the TREND_MONTHS months ending at `month`.

    The database only returns months that have data, so gaps are filled
    with zeros here to keep the chart's x axis continuous.
    """
    first = add_months(month, -(TREND_MONTHS - 1))
    rows = (
        Transaction.objects.filter(
            user=user, date__gte=first, date__lt=next_month(month)
        )
        .annotate(bucket=TruncMonth("date"))
        .values("bucket")
        .annotate(
            income=Sum("amount", filter=Q(category__type=INCOME)),
            expenses=Sum("amount", filter=Q(category__type=EXPENSE)),
        )
        .order_by("bucket")
    )
    by_month = {row["bucket"]: row for row in rows}

    trend = []
    for offset in range(TREND_MONTHS):
        current = add_months(first, offset)
        row = by_month.get(current, {})
        trend.append(
            {
                "month": format_month(current),
                "income": row.get("income") or ZERO,
                "expenses": row.get("expenses") or ZERO,
            }
        )
    return trend


def get_budgets(user, month):
    """Progress toward the monthly limit of each active expense category."""
    spent_in_month = Sum(
        "transactions__amount",
        filter=Q(
            transactions__date__gte=month,
            transactions__date__lt=next_month(month),
        ),
    )
    categories = Category.objects.filter(
        user=user, type=EXPENSE, is_archived=False, monthly_limit__gt=0
    ).annotate(spent=spent_in_month)

    budgets = []
    for category in categories:
        spent = category.spent or ZERO
        budgets.append(
            {
                "category_id": category.id,
                "name": category.name,
                "emoji": category.emoji,
                "limit": category.monthly_limit,
                "spent": spent,
                "percentage": _percentage(spent, category.monthly_limit),
                "status": get_budget_status(spent, category.monthly_limit),
            }
        )
    budgets.sort(key=lambda item: item["percentage"], reverse=True)
    return budgets


def get_recent_transactions(user, month):
    return list(
        _month_transactions(user, month).select_related("category")[:RECENT_LIMIT]
    )


def build_dashboard(user, month):
    return {
        "month": format_month(month),
        "summary": get_summary(user, month),
        "spending_by_category": get_spending_by_category(user, month),
        "monthly_trend": get_monthly_trend(user, month),
        "budgets": get_budgets(user, month),
        "recent_transactions": get_recent_transactions(user, month),
    }