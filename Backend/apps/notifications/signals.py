from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver

from apps.categories.models import Category
from apps.transactions.models import Transaction

from .services import check_budget_thresholds


def _check(transaction):
    # Reload the category so we never trust a stale in-memory limit
    category = Category.objects.filter(pk=transaction.category_id).first()
    if category is not None:
        check_budget_thresholds(category, transaction.date)


@receiver(post_save, sender=Transaction)
def check_budget_after_save(sender, instance, raw=False, **kwargs):
    if not raw:  # raw=True while loading fixtures
        _check(instance)


@receiver(post_delete, sender=Transaction)
def check_budget_after_delete(sender, instance, **kwargs):
    _check(instance)