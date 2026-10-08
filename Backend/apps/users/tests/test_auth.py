import pytest
from django.contrib.auth import get_user_model

pytestmark = pytest.mark.django_db

User = get_user_model()

REGISTER = "/api/auth/register/"
LOGIN = "/api/auth/login/"
LOGOUT = "/api/auth/logout/"
REFRESH = "/api/auth/refresh/"
ME = "/api/auth/me/"
PASSWORD = "StrongPass123!"


def login(client, email="user@example.com", password=PASSWORD):
    return client.post(LOGIN, {"email": email, "password": password}, format="json")


def test_register_creates_user_and_returns_tokens(api_client):
    payload = {"email": "New@Example.com", "password": PASSWORD, "first_name": "Ana"}
    res = api_client.post(REGISTER, payload, format="json")

    assert res.status_code == 201
    assert {"user", "access", "refresh"} <= set(res.data)
    assert res.data["user"]["email"] == "new@example.com"  # normalized
    assert "password" not in res.data["user"]
    assert User.objects.filter(email="new@example.com").exists()


def test_register_rejects_duplicate_email_case_insensitive(api_client, create_user):
    create_user(email="dup@example.com")
    res = api_client.post(
        REGISTER, {"email": "DUP@example.com", "password": PASSWORD}, format="json"
    )
    assert res.status_code == 400
    assert "email" in res.data


def test_register_rejects_weak_password(api_client):
    res = api_client.post(
        REGISTER, {"email": "weak@example.com", "password": "123"}, format="json"
    )
    assert res.status_code == 400
    assert "password" in res.data


def test_login_returns_tokens_and_user(api_client, user):
    res = login(api_client)
    assert res.status_code == 200
    assert {"access", "refresh", "user"} <= set(res.data)
    assert res.data["user"]["email"] == user.email


def test_login_is_case_insensitive_on_email(api_client, user):
    res = login(api_client, email="USER@Example.com")
    assert res.status_code == 200


def test_login_with_wrong_password_fails(api_client, user):
    res = login(api_client, password="wrong-password")
    assert res.status_code == 401


def test_me_requires_authentication(api_client):
    assert api_client.get(ME).status_code == 401


def test_me_returns_current_user(auth_client, user):
    res = auth_client.get(ME)
    assert res.status_code == 200
    assert res.data["email"] == user.email


def test_refresh_rotates_tokens(api_client, user):
    tokens = login(api_client).data
    res = api_client.post(REFRESH, {"refresh": tokens["refresh"]}, format="json")
    assert res.status_code == 200
    assert res.data["access"]
    assert res.data["refresh"] != tokens["refresh"]  # rotation is on


def test_logout_blacklists_refresh_token(api_client, user):
    tokens = login(api_client).data

    res = api_client.post(LOGOUT, {"refresh": tokens["refresh"]}, format="json")
    assert res.status_code == 205

    # The blacklisted refresh token can no longer be used
    res = api_client.post(REFRESH, {"refresh": tokens["refresh"]}, format="json")
    assert res.status_code == 401