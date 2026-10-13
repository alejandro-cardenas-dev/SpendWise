import pytest

from apps.categories.constants import DEFAULT_CATEGORIES
from apps.categories.models import Category

pytestmark = pytest.mark.django_db

URL = "/api/categories/"


def detail(pk):
    return f"{URL}{pk}/"


def test_registration_creates_default_categories(api_client):
    res = api_client.post(
        "/api/auth/register/",
        {"email": "new@example.com", "password": "StrongPass123!"},
        format="json",
    )
    assert res.status_code == 201

    categories = Category.objects.filter(user__email="new@example.com")
    assert categories.count() == len(DEFAULT_CATEGORIES)
    assert categories.filter(name="Food", emoji="🍔", type="expense").exists()
    assert categories.filter(name="Salary", emoji="💰", type="income").exists()


def test_list_returns_only_own_categories(auth_client, other_user, create_category):
    create_category(other_user, name="Secret")

    res = auth_client.get(URL)

    assert res.status_code == 200
    names = {c["name"] for c in res.data}
    assert "Secret" not in names
    assert len(res.data) == len(DEFAULT_CATEGORIES)  # only the user's defaults


def test_other_users_category_is_not_accessible(auth_client, other_user, create_category):
    foreign = create_category(other_user, name="Foreign")
    url = detail(foreign.pk)

    assert auth_client.get(url).status_code == 404
    assert auth_client.patch(url, {"name": "Hacked"}, format="json").status_code == 404
    assert auth_client.delete(url).status_code == 404

    foreign.refresh_from_db()
    assert foreign.name == "Foreign"


def test_create_assigns_owner_and_ignores_user_in_payload(auth_client, user, other_user):
    payload = {
        "name": "Gym",
        "emoji": "🏋️",
        "type": "expense",
        "monthly_limit": "50.00",
        "user": other_user.pk,  # must be ignored
    }
    res = auth_client.post(URL, payload, format="json")

    assert res.status_code == 201
    assert Category.objects.get(pk=res.data["id"]).user == user


def test_negative_monthly_limit_is_rejected(auth_client):
    res = auth_client.post(
        URL, {"name": "Gym", "emoji": "🏋️", "monthly_limit": "-1"}, format="json"
    )
    assert res.status_code == 400
    assert "monthly_limit" in res.data


def test_zero_monthly_limit_is_allowed(auth_client):
    res = auth_client.post(
        URL, {"name": "Gym", "emoji": "🏋️", "monthly_limit": "0"}, format="json"
    )
    assert res.status_code == 201


def test_income_category_cannot_have_limit(auth_client):
    res = auth_client.post(
        URL,
        {"name": "Bonus", "emoji": "🎉", "type": "income", "monthly_limit": "100"},
        format="json",
    )
    assert res.status_code == 400
    assert "monthly_limit" in res.data


def test_duplicate_name_is_rejected_case_insensitively(auth_client):
    # "Food" (expense) already exists as a default category
    res = auth_client.post(
        URL, {"name": "food", "emoji": "🍕", "type": "expense"}, format="json"
    )
    assert res.status_code == 400
    assert "name" in res.data


def test_same_name_allowed_for_other_user_or_other_type(auth_client, other_user, create_category):
    create_category(other_user, name="Pets")

    res = auth_client.post(URL, {"name": "Pets", "emoji": "🐶"}, format="json")
    assert res.status_code == 201

    # "Food" exists as an expense; as income it is a different category
    res = auth_client.post(
        URL, {"name": "Food", "emoji": "🍽️", "type": "income"}, format="json"
    )
    assert res.status_code == 201


def test_type_cannot_change_when_category_has_transactions(
    auth_client, user, category, create_transaction
):
    create_transaction(user, category)

    res = auth_client.patch(detail(category.pk), {"type": "income"}, format="json")

    assert res.status_code == 400
    assert "type" in res.data


def test_delete_category_with_transactions_returns_409(
    auth_client, user, category, create_transaction
):
    create_transaction(user, category)

    res = auth_client.delete(detail(category.pk))

    assert res.status_code == 409
    assert Category.objects.filter(pk=category.pk).exists()


def test_delete_unused_category(auth_client, category):
    res = auth_client.delete(detail(category.pk))

    assert res.status_code == 204
    assert not Category.objects.filter(pk=category.pk).exists()


def test_filter_by_type_and_archived(auth_client, user, create_category):
    create_category(user, name="Old", is_archived=True)

    res = auth_client.get(URL, {"is_archived": "true"})
    assert [c["name"] for c in res.data] == ["Old"]

    res = auth_client.get(URL, {"type": "income"})
    assert {c["type"] for c in res.data} == {"income"}


def test_requires_authentication(api_client):
    assert api_client.get(URL).status_code == 401