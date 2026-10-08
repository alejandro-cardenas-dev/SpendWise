import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient


@pytest.fixture
def api_client():
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
def auth_client(api_client, user):
    """APIClient already authenticated as `user`."""
    api_client.force_authenticate(user=user)
    return api_client