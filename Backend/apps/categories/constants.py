from decimal import Decimal

# Budget thresholds. The notifications and the dashboard both read these,
# so "80%" is defined in exactly one place.
WARNING_RATIO = Decimal("0.80")

BUDGET_OK = "ok"
BUDGET_WARNING = "warning"  # spent >= 80% of the limit
BUDGET_OVER = "over"  # spent >= 100% of the limit

DEFAULT_CATEGORIES = [
    ("Food", "🍔", "expense"),
    ("Transport", "🚌", "expense"),
    ("Rent", "🏠", "expense"),
    ("Utilities", "💡", "expense"),
    ("Health", "💊", "expense"),
    ("Entertainment", "🎬", "expense"),
    ("Shopping", "🛍️", "expense"),
    ("Education", "📚", "expense"),
    ("Other", "📦", "expense"),
    ("Salary", "💰", "income"),
    ("Freelance", "💻", "income"),
    ("Investments", "📈", "income"),
    ("Other income", "🎁", "income"),
]