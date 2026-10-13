import datetime
from decimal import Decimal

import pytest

from apps.transactions.models import Transaction

pytestmark = pytest.mark.django_db

URL = "/api/transactions/"


def detail(pk):
    return f"{URL}{pk}/"


def payload(category, **overrides):
    data = {
        "amount": "25.50",
        "category": category.pk,
        "date": "2026-01-15",
        "description": "Lunch",
    }
    data.update(overrides)
    return data


def test_create_transaction(auth_client, user, category):
    res = auth_client.post(URL, payload(category), format="json")

    assert res.status_code == 201
    assert res.data["amount"] == "25.50"
    assert res.data["type"] == "expense"  # derived from the category
    assert res.data["category_detail"]["name"] == category.name
    assert Transaction.objects.get(pk=res.data["id"]).user == user


@pytest.mark.parametrize("amount", ["0", "-5", "-0.01"])
def test_amount_must_be_positive(auth_client, category, amount):
    res = auth_client.post(URL, payload(category, amount=amount), format="json")

    assert res.status_code == 400
    assert "amount" in res.data
    assert Transaction.objects.count() == 0


def test_amount_allows_at_most_two_decimals(auth_client, category):
    res = auth_client.post(URL, payload(category, amount="10.999"), format="json")

    assert res.status_code == 400
    assert "amount" in res.data


def test_cannot_use_another_users_category(auth_client, other_user, create_category):
    foreign = create_category(other_user, name="Foreign")

    res = auth_client.post(URL, payload(foreign), format="json")

    assert res.status_code == 400
    assert "category" in res.data
    assert Transaction.objects.count() == 0


def test_cannot_create_in_archived_category(auth_client, user, create_category):
    archived = create_category(user, name="Old", is_archived=True)

    res = auth_client.post(URL, payload(archived), format="json")

    assert res.status_code == 400
    assert "category" in res.data


def test_can_edit_transaction_in_archived_category(
    auth_client, user, category, create_transaction
):
    tx = create_transaction(user, category)
    category.is_archived = True
    category.save()

    res = auth_client.patch(detail(tx.pk), {"description": "Fixed typo"}, format="json")

    assert res.status_code == 200
    assert res.data["description"] == "Fixed typo"


def test_list_returns_only_own_transactions(
    auth_client, user, other_user, category, create_category, create_transaction
):
    mine = create_transaction(user, category)
    create_transaction(other_user, create_category(other_user, name="Foreign"))

    res = auth_client.get(URL)

    assert res.status_code == 200
    assert res.data["count"] == 1
    assert res.data["results"][0]["id"] == mine.id


def test_other_users_transaction_is_not_accessible(
    auth_client, other_user, create_category, create_transaction
):
    foreign = create_transaction(other_user, create_category(other_user, name="Foreign"))
    url = detail(foreign.pk)

    assert auth_client.get(url).status_code == 404
    assert auth_client.patch(url, {"description": "x"}, format="json").status_code == 404
    assert auth_client.delete(url).status_code == 404
    assert Transaction.objects.filter(pk=foreign.pk).exists()


def test_update_rejects_another_users_category(
    auth_client, user, other_user, category, create_category, create_transaction
):
    tx = create_transaction(user, category)
    foreign = create_category(other_user, name="Foreign")

    res = auth_client.patch(detail(tx.pk), {"category": foreign.pk}, format="json")

    assert res.status_code == 400
    tx.refresh_from_db()
    assert tx.category_id == category.id


def test_filters(auth_client, user, category, income_category, create_transaction):
    jan = create_transaction(
        user, category, amount="10", date=datetime.date(2026, 1, 10),
        description="Coffee beans",
    )
    feb = create_transaction(
        user, category, amount="20", date=datetime.date(2026, 2, 10),
        description="Train ticket",
    )
    pay = create_transaction(
        user, income_category, amount="1000", date=datetime.date(2026, 1, 31),
        description="January pay",
    )

    def ids(**params):
        res = auth_client.get(URL, params)
        assert res.status_code == 200
        return {t["id"] for t in res.data["results"]}

    assert ids(category=category.pk) == {jan.id, feb.id}
    assert ids(type="income") == {pay.id}
    assert ids(date_from="2026-01-31", date_to="2026-02-28") == {pay.id, feb.id}
    assert ids(search="train") == {feb.id}
    assert ids(min_amount="15") == {feb.id, pay.id}


def test_default_ordering_and_custom_ordering(auth_client, user, category, create_transaction):
    create_transaction(user, category, amount="30", date=datetime.date(2026, 1, 1))
    create_transaction(user, category, amount="10", date=datetime.date(2026, 3, 1))
    create_transaction(user, category, amount="20", date=datetime.date(2026, 2, 1))

    res = auth_client.get(URL)
    dates = [t["date"] for t in res.data["results"]]
    assert dates == sorted(dates, reverse=True)  # newest first by default

    res = auth_client.get(URL, {"ordering": "amount"})
    amounts = [Decimal(t["amount"]) for t in res.data["results"]]
    assert amounts == sorted(amounts)


def test_pagination(auth_client, user, category):
    Transaction.objects.bulk_create(
        [
            Transaction(
                user=user, category=category, amount=Decimal("1.00"),
                date=datetime.date(2026, 1, 1),
            )
            for _ in range(25)
        ]
    )

    res = auth_client.get(URL)
    assert res.data["count"] == 25
    assert len(res.data["results"]) == 20  # PAGE_SIZE
    assert res.data["next"] is not None

    res = auth_client.get(URL, {"page": 2})
    assert len(res.data["results"]) == 5


def test_delete_transaction(auth_client, user, category, create_transaction):
    tx = create_transaction(user, category)

    res = auth_client.delete(detail(tx.pk))

    assert res.status_code == 204
    assert not Transaction.objects.filter(pk=tx.pk).exists()


def test_requires_authentication(api_client):
    assert api_client.get(URL).status_code == 401