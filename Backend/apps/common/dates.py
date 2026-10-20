import datetime


def month_start(value):
    """First day of the month of `value` (a date, datetime or ISO string)."""
    if isinstance(value, str):
        value = datetime.date.fromisoformat(value)
    return datetime.date(value.year, value.month, 1)


def add_months(value, months):
    """First day of the month that is `months` away from `value`'s month."""
    index = value.year * 12 + (value.month - 1) + months
    return datetime.date(index // 12, index % 12 + 1, 1)


def next_month(value):
    return add_months(month_start(value), 1)


def parse_month(text):
    """'2026-10' -> date(2026, 10, 1). Raises ValueError on bad input."""
    parsed = datetime.datetime.strptime(text, "%Y-%m").date()
    if not 1900 <= parsed.year <= 2100:
        raise ValueError("Year out of range.")
    return parsed


def format_month(value):
    return value.strftime("%Y-%m")