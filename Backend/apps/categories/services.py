from .constants import DEFAULT_CATEGORIES
from .models import Category


def create_default_categories(user):
    """Give a new user the starter set of categories."""
    Category.objects.bulk_create(
        [
            Category(user=user, name=name, emoji=emoji, type=type_)
            for name, emoji, type_ in DEFAULT_CATEGORIES
        ]
    )