from .constants import (
    BUDGET_OK,
    BUDGET_OVER,
    BUDGET_WARNING,
    DEFAULT_CATEGORIES,
    WARNING_RATIO,
)
from .models import Category


def create_default_categories(user):
    """Give a new user the starter set of categories."""
    Category.objects.bulk_create(
        [
            Category(user=user, name=name, emoji=emoji, type=type_)
            for name, emoji, type_ in DEFAULT_CATEGORIES
        ]
    )


def get_budget_status(spent, limit):
    """Where `spent` stands against a positive `limit`: ok, warning or over."""
    if spent >= limit:
        return BUDGET_OVER
    if spent >= limit * WARNING_RATIO:
        return BUDGET_WARNING
    return BUDGET_OK