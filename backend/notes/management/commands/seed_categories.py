"""
Management command to seed default categories.
Creates the 3 aesthetic default categories if they don't exist.
"""
from django.core.management.base import BaseCommand

from notes.models import Category


class Command(BaseCommand):
    help = "Seeds default categories for the notes app"

    def handle(self, *args, **kwargs):
        """
        Create default categories with aesthetic colors.
        Uses get_or_create to be idempotent.
        """
        default_categories = [
            {
                "name": "Random Thoughts",
                "color_hex": "#FFB08F",  # Peach
                "slug": "random-thoughts",
            },
            {
                "name": "School",
                "color_hex": "#FFD966",  # Yellow
                "slug": "school",
            },
            {
                "name": "Personal",
                "color_hex": "#7DD3C0",  # Teal
                "slug": "personal",
            },
        ]

        created_count = 0
        for cat_data in default_categories:
            category, created = Category.objects.get_or_create(
                slug=cat_data["slug"],
                defaults={
                    "name": cat_data["name"],
                    "color_hex": cat_data["color_hex"],
                },
            )
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f"Created category: {category.name}")
                )
            else:
                self.stdout.write(f"Category already exists: {category.name}")

        self.stdout.write(
            self.style.SUCCESS(f"\nSeeding complete. Created {created_count} new categories.")
        )

