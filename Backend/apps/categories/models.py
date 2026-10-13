from django.conf import settings
from django.db import models


class Category(models.Model):
    class Type(models.TextChoices):
        EXPENSE = "expense", "Expense"
        INCOME = "income", "Income"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="categories",
    )
    name = models.CharField(max_length=60)
    emoji = models.CharField(max_length=16, default="📦")  # ZWJ emojis need >1 char
    type = models.CharField(
        max_length=10, choices=Type.choices, default=Type.EXPENSE
    )
    monthly_limit = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True
    )
    is_archived = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "categories"
        ordering = ("type", "name")
        constraints = [
            models.UniqueConstraint(
                fields=["user", "name", "type"], name="unique_category_per_user"
            ),
            models.CheckConstraint(
                condition=models.Q(monthly_limit__isnull=True)
                | models.Q(monthly_limit__gte=0),
                name="category_monthly_limit_gte_0",
            ),
        ]

    def __str__(self):
        return f"{self.emoji} {self.name}"