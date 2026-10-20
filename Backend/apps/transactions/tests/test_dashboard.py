import datetime
from decimal import Decimal

import pytest

pytestmark = pytest.mark.django_db

URL = "/api/dashboard/"
JAN = {"month": "2026-01"}


def test_summary_covers_only_the_selected_month(
    auth_client, user, category, income_category, create_transaction
):
    create_transaction(user, category, amount="40.50", date=datetime.date(2026, 1, 5))
    create_transaction(user, category, amount="9.50", date=datetime.date(2026, 1, 31))
    create_transaction(user, income_category, amount="1000", date=datetime.date(2026, 1, 1))
    create_transaction(user, category, amount="999", date=datetime.date(2026, 2, 1))
    create_transaction(user, category, amount="999", date=datetime.date(2025, 12, 31))

    res = auth_client.get(URL, JAN)

    assert res.status_code == 200
    assert res.data["month"] == "2026-01"
    assert res.data["summary"] == {
        "total_income": "1000.00",
        "total_expenses": "50.00",
        "balance": "950.00",
    }


def test_empty_month_returns_zeros_and_empty_lists(auth_client):
    res = auth_client.get(URL, JAN)

    assert res.status_code == 200
    assert res.data["summary"]["balance"] == "0.00"
    assert res.data["spending_by_category"] == []
    assert res.data["budgets"] == []
    assert res.data["recent_transactions"] == []
    assert len(res.data["monthly_trend"]) == 6


def test_spending_by_category_counts_only_expenses_sorted_with_percentages(
    auth_client, user, category, income_category, create_category, create_transaction
):
    gym = create_category(user, name="Gym")
    create_transaction(user, gym, amount="25")
    create_transaction(user, category, amount="75")
    create_transaction(user, income_category, amount="500")

    rows = auth_client.get(URL, JAN).data["spending_by_category"]

    assert [r["name"] for r in rows] == [category.name, "Gym"]
    assert [r["total"] for r in rows] == ["75.00", "25.00"]
    assert [r["percentage"] for r in rows] == ["75.0", "25.0"]


def test_monthly_trend_covers_six_months_and_fills_gaps(
    auth_client, user, category, income_category, create_transaction
):
    create_transaction(user, category, amount="5", date=datetime.date(2025, 8, 31))  # outside
    create_transaction(user, category, amount="10", date=datetime.date(2025, 10, 20))
    create_transaction(user, income_category, amount="300", date=datetime.date(2025, 12, 1))
    create_transaction(user, category, amount="20", date=datetime.date(2026, 2, 14))

    trend = auth_client.get(URL, {"month": "2026-02"}).data["monthly_trend"]

    assert [t["month"] for t in trend] == [
        "2025-09", "2025-10", "2025-11", "2025-12", "2026-01", "2026-02",
    ]
    by_month = {t["month"]: t for t in trend}
    assert by_month["2025-09"]["expenses"] == "0.00"  # Aug 31 is outside the window
    assert by_month["2025-10"]["expenses"] == "10.00"
    assert by_month["2025-11"] == {"month": "2025-11", "income": "0.00", "expenses": "0.00"}
    assert by_month["2025-12"]["income"] == "300.00"
    assert by_month["2026-02"]["expenses"] == "20.00"


def test_budgets_report_a_status_for_each_category_with_a_limit(
    auth_client, user, create_category, create_transaction
):
    ok = create_category(user, name="A ok", monthly_limit=Decimal("100"))
    warn = create_category(user, name="B warn", monthly_limit=Decimal("100"))
    over = create_category(user, name="C over", monthly_limit=Decimal("100"))
    create_category(user, name="No limit")
    create_category(user, name="Archived", monthly_limit=Decimal("100"), is_archived=True)
    create_transaction(user, ok, amount="50")
    create_transaction(user, warn, amount="80")
    create_transaction(user, over, amount="130")

    budgets = auth_client.get(URL, JAN).data["budgets"]

    # Most-used budget first; categories without a limit or archived are left out
    assert [(b["name"], b["status"]) for b in budgets] == [
        ("C over", "over"),
        ("B warn", "warning"),
        ("A ok", "ok"),
    ]
    assert budgets[0]["limit"] == "100.00"
    assert budgets[0]["spent"] == "130.00"
    assert budgets[0]["percentage"] == "130.0"


def test_dashboard_only_includes_own_data(
    auth_client, other_user, create_category, create_transaction
):
    foreign = create_category(other_user, name="Foreign", monthly_limit=Decimal("10"))
    create_transaction(other_user, foreign, amount="500")

    res = auth_client.get(URL, JAN)

    assert res.data["summary"]["total_expenses"] == "0.00"
    assert res.data["spending_by_category"] == []
    assert res.data["budgets"] == []
    assert res.data["recent_transactions"] == []


def test_recent_transactions_are_limited_to_five_newest_of_the_month(
    auth_client, user, category, create_transaction
):
    for day in range(1, 8):
        create_transaction(user, category, amount="1", date=datetime.date(2026, 1, day))
    create_transaction(user, category, amount="1", date=datetime.date(2026, 2, 1))

    recent = auth_client.get(URL, JAN).data["recent_transactions"]

    assert [t["date"] for t in recent] == [
        "2026-01-07", "2026-01-06", "2026-01-05", "2026-01-04", "2026-01-03",
    ]
    assert recent[0]["category_detail"]["name"] == category.name


@pytest.mark.parametrize("value", ["2026-13", "january", "2026-01-15", "0001-01"])
def test_invalid_month_returns_400(auth_client, value):
    res = auth_client.get(URL, {"month": value})

    assert res.status_code == 400
    assert "month" in res.data


def test_month_defaults_to_the_current_month(auth_client):
    res = auth_client.get(URL)

    assert res.status_code == 200
    assert len(res.data["month"]) == 7  # "YYYY-MM"


def test_requires_authentication(api_client):
    assert api_client.get(URL).status_code == 401