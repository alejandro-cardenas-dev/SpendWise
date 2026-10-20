import datetime
from decimal import Decimal

import pytest

from apps.notifications.models import Notification
from apps.notifications.services import check_budget_thresholds

pytestmark = pytest.mark.django_db

JAN = datetime.date(2026, 1, 1)


def types():
    """Sorted notification types that exist (each test uses a single user)."""
    return sorted(Notification.objects.values_list("type", flat=True))


def test_no_notification_below_the_warning_threshold(user, budget_category, create_transaction):
    create_transaction(user, budget_category, amount="79.99")

    assert Notification.objects.count() == 0


def test_warning_is_created_at_exactly_80_percent(user, budget_category, create_transaction):
    create_transaction(user, budget_category, amount="80.00")

    assert types() == ["warning"]


def test_limit_reached_is_created_at_exactly_100_percent(user, budget_category, create_transaction):
    create_transaction(user, budget_category, amount="80.00")
    assert types() == ["warning"]

    create_transaction(user, budget_category, amount="20.00")

    assert types() == ["limit_reached", "warning"]


def test_a_single_big_transaction_creates_both_notifications(user, budget_category, create_transaction):
    create_transaction(user, budget_category, amount="120.00")

    assert types() == ["limit_reached", "warning"]


def test_no_duplicates_when_more_transactions_arrive(user, budget_category, create_transaction):
    for amount in ("85", "5", "20", "30"):  # 85%, 90%, 110%, 140%
        create_transaction(user, budget_category, amount=amount)

    assert types() == ["limit_reached", "warning"]

    # Calling the service directly again is idempotent too
    assert check_budget_thresholds(budget_category, JAN) == []
    assert Notification.objects.count() == 2


def test_each_month_gets_its_own_notification(user, budget_category, create_transaction):
    create_transaction(user, budget_category, amount="90", date=datetime.date(2026, 1, 10))
    create_transaction(user, budget_category, amount="90", date=datetime.date(2026, 2, 10))

    months = sorted(Notification.objects.values_list("month", flat=True))
    assert months == [datetime.date(2026, 1, 1), datetime.date(2026, 2, 1)]


def test_spending_in_other_months_does_not_count(user, budget_category, create_transaction):
    create_transaction(user, budget_category, amount="90", date=datetime.date(2025, 12, 31))
    create_transaction(user, budget_category, amount="20", date=datetime.date(2026, 1, 1))

    # December is at 90% (warning); January is only at 20% (nothing)
    months = list(Notification.objects.values_list("month", flat=True))
    assert months == [datetime.date(2025, 12, 1)]


def test_spending_in_other_categories_does_not_count(
    user, budget_category, category, create_transaction
):
    create_transaction(user, category, amount="500")  # category without a limit
    create_transaction(user, budget_category, amount="10")

    assert Notification.objects.count() == 0


@pytest.mark.parametrize("limit", [None, "0"])
def test_no_notifications_without_a_positive_limit(user, create_category, create_transaction, limit):
    category = create_category(
        user, name="Loose", monthly_limit=None if limit is None else Decimal(limit)
    )

    create_transaction(user, category, amount="500")

    assert Notification.objects.count() == 0


def test_income_categories_never_notify(user, income_category, create_transaction):
    # The API forbids limits on income categories; force one to prove the
    # service guards against it anyway.
    income_category.monthly_limit = Decimal("100")
    income_category.save()

    create_transaction(user, income_category, amount="500")

    assert Notification.objects.count() == 0


def test_deleting_a_transaction_keeps_history_and_adds_no_duplicates(
    user, budget_category, create_transaction
):
    tx = create_transaction(user, budget_category, amount="90")
    assert types() == ["warning"]

    tx.delete()

    assert types() == ["warning"]


def test_notification_content(user, budget_category, create_transaction):
    create_transaction(
        user, budget_category, amount="85.50", date=datetime.date(2026, 1, 20)
    )

    notification = Notification.objects.get()
    assert notification.user == user
    assert notification.category == budget_category
    assert notification.month == JAN  # always the first day of the month
    assert notification.is_read is False
    assert "Dining out" in notification.message
    assert "January 2026" in notification.message
    assert "85.50 of 100.00" in notification.message


def test_updating_the_amount_can_trigger_a_notification(
    auth_client, user, budget_category, create_transaction
):
    tx = create_transaction(user, budget_category, amount="10")
    assert Notification.objects.count() == 0

    res = auth_client.patch(f"/api/transactions/{tx.pk}/", {"amount": "95.00"}, format="json")

    assert res.status_code == 200
    assert types() == ["warning"]


def test_moving_a_transaction_checks_the_new_category_and_month(
    auth_client, user, budget_category, category, create_transaction
):
    tx = create_transaction(user, category, amount="90", date=datetime.date(2026, 3, 5))

    res = auth_client.patch(
        f"/api/transactions/{tx.pk}/",
        {"category": budget_category.pk, "date": "2026-04-02"},
        format="json",
    )

    assert res.status_code == 200
    notification = Notification.objects.get()
    assert notification.category_id == budget_category.id
    assert notification.month == datetime.date(2026, 4, 1)
    assert notification.type == "warning"


def test_creating_a_transaction_through_the_api_notifies_end_to_end(auth_client, budget_category):
    res = auth_client.post(
        "/api/transactions/",
        {"amount": "85.00", "category": budget_category.pk, "date": "2026-01-20"},
        format="json",
    )
    assert res.status_code == 201

    res = auth_client.get("/api/notifications/")

    assert res.data["count"] == 1
    item = res.data["results"][0]
    assert item["type"] == "warning"
    assert item["month"] == "2026-01-01"
    assert item["is_read"] is False
    assert "Dining out" in item["message"]