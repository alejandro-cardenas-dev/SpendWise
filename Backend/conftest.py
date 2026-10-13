import datetime
from decimal import Decimal

import pytest
from django.contrib.auth import get_user_model


@pytest.fixture
def api_client():
    from rest_framework.test import APIClient  # imported lazily on purpose

    return APIClient()


@pytest.fixture
def create_user(db):
    """Factory: create_user(email="x@example.com") -> User"""

    def _create(email="user@example.com", password="StrongPass123!", **extra):
        return get_user_model().objects.create_user(
            email=email, password=password, **extra
        )

    return _create


@pytest.fixture
def user(create_user):
    return create_user()


@pytest.fixture
def other_user(create_user):
    return create_user(email="other@example.com")


@pytest.fixture
def auth_client(api_client, user):
    """APIClient already authenticated as `user`."""
    api_client.force_authenticate(user=user)
    return api_client


@pytest.fixture
def other_client(other_user):
    """A separate APIClient authenticated as `other_user`."""
    from rest_framework.test import APIClient

    client = APIClient()
    client.force_authenticate(user=other_user)
    return client


@pytest.fixture
def create_category(db):
    """Factory. Default names avoid clashing with the auto-created defaults."""
    from apps.categories.models import Category

    def _create(user, name="Groceries", emoji="🛒", type="expense", **extra):
        return Category.objects.create(
            user=user, name=name, emoji=emoji, type=type, **extra
        )

    return _create


@pytest.fixture
def category(user, create_category):
    return create_category(user)


@pytest.fixture
def income_category(user, create_category):
    return create_category(user, name="Side gig", emoji="💼", type="income")


@pytest.fixture
def create_transaction(db):
    from apps.transactions.models import Transaction

    def _create(user, category, amount="10.00", date=None, description="", **extra):
        return Transaction.objects.create(
            user=user,
            category=category,
            amount=Decimal(amount),
            date=date or datetime.date(2026, 1, 15),
            description=description,
            **extra,
        )

    return _create