from django.conf import settings
from django.db import models


class Notification(models.Model):
    class Type(models.TextChoices):
        WARNING = "warning", "Warning (80% of the limit)"
        LIMIT_REACHED = "limit_reached", "Limit reached (100%)"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications",
    )
    category = models.ForeignKey(
        "categories.Category",
        on_delete=models.CASCADE,
        related_name="notifications",
    )
    type = models.CharField(max_length=20, choices=Type.choices)
    message = models.CharField(max_length=255)
    # Always the FIRST DAY of the month the notification is about
    month = models.DateField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-created_at", "-id")
        indexes = [models.Index(fields=["user", "is_read"])]
        constraints = [
            # The "no duplicates" rule, enforced by the database itself
            models.UniqueConstraint(
                fields=["user", "category", "month", "type"],
                name="unique_notification_per_category_month_type",
            ),
        ]

    def __str__(self):
        return f"{self.type} - {self.category.name} - {self.month:%Y-%m}"