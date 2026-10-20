from decimal import Decimal

from django.db.models import Sum

from apps.categories.constants import BUDGET_OVER, BUDGET_WARNING
from apps.categories.models import Category
from apps.categories.services import get_budget_status
from apps.common.dates import month_start, next_month
from apps.transactions.models import Transaction

from .models import Notification


def get_month_spending(category, month):
    """Total spent in `category` during the month that contains `month`."""
    start = month_start(month)
    total = Transaction.objects.filter(
        user_id=category.user_id,
        category=category,
        date__gte=start,
        date__lt=next_month(start),
    ).aggregate(total=Sum("amount"))["total"]
    return total or Decimal("0")


def build_message(type_, category, month, spent, limit):
    label = f"{category.emoji} {category.name}"
    period = f"{month:%B %Y}"
    figures = f"{spent:.2f} of {limit:.2f}"
    if type_ == Notification.Type.LIMIT_REACHED:
        return f"You reached your {period} limit for {label}: {figures}."
    percent = int(spent / limit * 100)
    return f"You have used {percent}% of your {period} limit for {label}: {figures}."


def check_budget_thresholds(category, month):
    """Create the notifications that the category's spending in `month` calls for.

    Idempotent: calling it twice creates nothing the second time, because
    there is one notification per (user, category, month, type).
    Returns the notifications that were newly created.
    """
    limit = category.monthly_limit
    # No limit, or a limit of 0, means "no budget": nothing to warn about.
    if category.type != Category.Type.EXPENSE or limit is None or limit <= 0:
        return []

    month = month_start(month)
    status = get_budget_status(get_month_spending(category, month), limit)

    wanted = []
    if status in (BUDGET_WARNING, BUDGET_OVER):
        wanted.append(Notification.Type.WARNING)
    if status == BUDGET_OVER:
        wanted.append(Notification.Type.LIMIT_REACHED)

    spent = get_month_spending(category, month)
    created = []
    for type_ in wanted:
        # get_or_create + the unique constraint also covers two requests
        # racing each other: the loser gets the existing row.
        notification, was_created = Notification.objects.get_or_create(
            user_id=category.user_id,
            category=category,
            month=month,
            type=type_,
            defaults={"message": build_message(type_, category, month, spent, limit)},
        )
        if was_created:
            created.append(notification)
    return created