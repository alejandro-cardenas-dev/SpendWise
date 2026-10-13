from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from apps.categories.services import create_default_categories


class Command(BaseCommand):
    help = "Create the default categories for users that have none (e.g. accounts made before this feature)."

    def handle(self, *args, **options):
        users = get_user_model().objects.filter(categories__isnull=True)
        count = 0
        for user in users:
            create_default_categories(user)
            count += 1
        self.stdout.write(
            self.style.SUCCESS(f"Default categories created for {count} user(s).")
        )