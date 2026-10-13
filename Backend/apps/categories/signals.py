from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver

from .services import create_default_categories


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_default_categories_for_new_user(sender, instance, created, raw=False, **kwargs):
    # `raw` is True when loading fixtures; don't add data in that case
    if created and not raw:
        create_default_categories(instance)