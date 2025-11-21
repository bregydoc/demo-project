"""
DRF serializers for API data transformation.
Maps domain models to JSON representations for the frontend.
"""
from rest_framework import serializers

from .models import Category, Note


class CategorySerializer(serializers.ModelSerializer):
    """
    Serializer for Category with note count.
    Provides read-only count of notes for sidebar display.
    """

    note_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ["id", "name", "color_hex", "slug", "note_count", "created_at"]
        read_only_fields = ["id", "slug", "created_at"]

    def get_note_count(self, obj):
        """Return count of notes in this category for the current user."""
        request = self.context.get("request")
        if request and hasattr(request, "user") and request.user.is_authenticated:
            return obj.notes.filter(owner=request.user).count()
        return 0


class NoteSerializer(serializers.ModelSerializer):
    """
    Serializer for Note with nested category info.
    Auto-assigns owner from request context on creation.
    """

    category_detail = CategorySerializer(source="category", read_only=True)
    owner_username = serializers.CharField(source="owner.username", read_only=True)

    class Meta:
        model = Note
        fields = [
            "id",
            "title",
            "content",
            "category",
            "category_detail",
            "owner",
            "owner_username",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "owner", "created_at", "updated_at"]

    def create(self, validated_data):
        """Auto-assign the current user as owner."""
        validated_data["owner"] = self.context["request"].user
        return super().create(validated_data)

