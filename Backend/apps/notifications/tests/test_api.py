import datetime

import pytest

pytestmark = pytest.mark.django_db

URL = "/api/notifications/"


def test_list_returns_only_own_notifications(
    auth_client, user, other_user, category, create_category, create_notification
):
    mine = create_notification(user, category)
    create_notification(other_user, create_category(other_user, name="Foreign"))

    res = auth_client.get(URL)

    assert res.status_code == 200
    assert [n["id"] for n in res.data["results"]] == [mine.id]
    assert res.data["results"][0]["category"]["name"] == category.name


def test_filter_by_is_read_and_type(auth_client, user, category, create_notification):
    unread = create_notification(user, category, type="warning")
    create_notification(user, category, type="warning", month=datetime.date(2026, 2, 1), is_read=True)
    limit = create_notification(user, category, type="limit_reached")

    res = auth_client.get(URL, {"is_read": "false"})
    assert {n["id"] for n in res.data["results"]} == {unread.id, limit.id}

    res = auth_client.get(URL, {"type": "limit_reached"})
    assert [n["id"] for n in res.data["results"]] == [limit.id]


def test_unread_count_ignores_read_and_foreign_notifications(
    auth_client, user, other_user, category, create_category, create_notification
):
    create_notification(user, category, type="warning")
    create_notification(user, category, type="limit_reached")
    create_notification(user, category, month=datetime.date(2026, 2, 1), is_read=True)
    create_notification(other_user, create_category(other_user, name="Foreign"))

    res = auth_client.get(f"{URL}unread-count/")

    assert res.status_code == 200
    assert res.data == {"count": 2}


def test_mark_one_as_read_is_idempotent(auth_client, user, category, create_notification):
    notification = create_notification(user, category)

    for _ in range(2):
        res = auth_client.post(f"{URL}{notification.pk}/read/")
        assert res.status_code == 200
        assert res.data["is_read"] is True

    notification.refresh_from_db()
    assert notification.is_read is True


def test_cannot_mark_another_users_notification(
    auth_client, other_user, create_category, create_notification
):
    foreign = create_notification(other_user, create_category(other_user, name="Foreign"))

    res = auth_client.post(f"{URL}{foreign.pk}/read/")

    assert res.status_code == 404
    foreign.refresh_from_db()
    assert foreign.is_read is False


def test_mark_all_as_read_only_affects_own_notifications(
    auth_client, user, other_user, category, create_category, create_notification
):
    create_notification(user, category, type="warning")
    create_notification(user, category, type="limit_reached")
    theirs = create_notification(other_user, create_category(other_user, name="Foreign"))

    res = auth_client.post(f"{URL}read-all/")

    assert res.status_code == 200
    assert res.data == {"updated": 2}
    assert auth_client.get(f"{URL}unread-count/").data == {"count": 0}
    theirs.refresh_from_db()
    assert theirs.is_read is False


def test_requires_authentication(api_client):
    assert api_client.get(URL).status_code == 401
    assert api_client.get(f"{URL}unread-count/").status_code == 401
    assert api_client.post(f"{URL}read-all/").status_code == 401