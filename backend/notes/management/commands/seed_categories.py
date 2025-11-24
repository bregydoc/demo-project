"""
Management command to seed default categories and demo user.
Creates the 3 aesthetic default categories and a demo user if they don't exist.
"""
from django.contrib.auth.models import User
from django.core.management.base import BaseCommand

from notes.models import Category


class Command(BaseCommand):
    help = "Seeds default categories and demo user for the notes app"

    def handle(self, *args, **kwargs):
        """
        Create default categories with aesthetic colors and a demo user.
        Uses get_or_create to be idempotent.
        """
        import sys
        
        self.stdout.write("Starting seed process...")
        self.stdout.flush()
        
        # Seed categories
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

        categories_created = 0
        for cat_data in default_categories:
            category, created = Category.objects.get_or_create(
                slug=cat_data["slug"],
                defaults={
                    "name": cat_data["name"],
                    "color_hex": cat_data["color_hex"],
                },
            )
            if created:
                categories_created += 1
                self.stdout.write(
                    self.style.SUCCESS(f"Created category: {category.name}")
                )
            else:
                self.stdout.write(f"Category already exists: {category.name}")
            self.stdout.flush()

        # Seed demo user
        self.stdout.write("\nChecking for demo user...")
        self.stdout.flush()
        
        # Check if user exists first
        existing_user = User.objects.filter(username="demo").first()
        if existing_user:
            self.stdout.write(f"Demo user already exists: {existing_user.username}")
            self.stdout.write(f"  ID: {existing_user.id}, Active: {existing_user.is_active}")
            self.stdout.flush()
        
        demo_user, user_created = User.objects.get_or_create(
            username="demo",
            defaults={
                "email": "demo@example.com",
            },
        )
        
        if user_created:
            demo_user.set_password("demo")
            demo_user.save()
            self.stdout.write(
                self.style.SUCCESS(
                    f"\n✓ Created demo user: {demo_user.username} (password: demo)"
                )
            )
            self.stdout.write(f"  User ID: {demo_user.id}")
            self.stdout.write(f"  Active: {demo_user.is_active}")
            self.stdout.flush()
            
            # Verify password was set correctly
            if demo_user.check_password("demo"):
                self.stdout.write("  ✓ Password verification: SUCCESS")
            else:
                self.stdout.write(self.style.ERROR("  ✗ Password verification FAILED!"))
                sys.exit(1)
        else:
            # Update password in case it was changed
            demo_user.set_password("demo")
            demo_user.save()
            self.stdout.write(
                f"\n✓ Demo user already exists: {demo_user.username} (password reset to: demo)"
            )
            self.stdout.write(f"  User ID: {demo_user.id}")
            self.stdout.flush()
            
            # Verify password
            if demo_user.check_password("demo"):
                self.stdout.write("  ✓ Password verification: SUCCESS")
            else:
                self.stdout.write(self.style.ERROR("  ✗ Password verification FAILED!"))
                sys.exit(1)

        self.stdout.write(
            self.style.SUCCESS(
                f"\n✓ Seeding complete. Created {categories_created} new categories."
            )
        )
        self.stdout.flush()
        
        # Final verification
        final_user = User.objects.filter(username="demo").first()
        if final_user and final_user.check_password("demo"):
            self.stdout.write("✓ Final verification: Demo user exists and password is correct")
        else:
            self.stdout.write(self.style.ERROR("✗ Final verification FAILED!"))
            sys.exit(1)

