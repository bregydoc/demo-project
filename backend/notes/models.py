"""
Domain models for the notes app.
Keeps data structures simple and focused on core business entities.
"""
from django.conf import settings
from django.db import models
from django.utils.text import slugify


class Category(models.Model):
    """
    Category for organizing notes with aesthetic color coding.
    Pre-seeded with default categories: Random Thoughts, School, Personal.
    """

    name = models.CharField(max_length=100, unique=True)
    color_hex = models.CharField(
        max_length=7,
        help_text="Hex color code for aesthetic UI (e.g., #FFB6C1)",
    )
    slug = models.SlugField(max_length=100, unique=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]
        verbose_name_plural = "categories"

    def save(self, *args, **kwargs):
        """Auto-generate slug from name if not provided."""
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Note(models.Model):
    """
    Core note entity with title, content, and category association.
    Tracks creation and update timestamps for audit trail.
    """

    title = models.CharField(max_length=255)
    content = models.TextField(blank=True)
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name="notes",
    )
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notes",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]
        indexes = [
            models.Index(fields=["-updated_at"]),
            models.Index(fields=["owner", "category"]),
        ]

    def __str__(self):
        return f"{self.title} ({self.category.name})"

