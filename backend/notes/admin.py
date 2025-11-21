"""
Admin configuration for notes app.
"""
from django.contrib import admin

from .models import Category, Note


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "color_hex", "slug", "created_at"]
    prepopulated_fields = {"slug": ["name"]}
    search_fields = ["name"]


@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    list_display = ["title", "category", "owner", "created_at", "updated_at"]
    list_filter = ["category", "created_at", "updated_at"]
    search_fields = ["title", "content"]
    readonly_fields = ["created_at", "updated_at"]

