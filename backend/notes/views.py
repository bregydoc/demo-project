"""
API ViewSets using DRF ModelViewSet pattern.
Implements filtering, permissions, and query optimization.
"""
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.db.models import Prefetch
from rest_framework import status, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import Category, Note
from .serializers import CategorySerializer, NoteSerializer


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only viewset for categories.
    Returns all categories with note counts for the current user.
    """

    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]


class NoteViewSet(viewsets.ModelViewSet):
    """
    Full CRUD viewset for notes.
    Supports filtering by category_id query parameter.
    Automatically scopes to current user's notes.
    """

    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Return notes owned by current user.
        Optimizes queries with select_related for category.
        Supports optional category_id filter.
        """
        queryset = (
            Note.objects.filter(owner=self.request.user)
            .select_related("category", "owner")
            .order_by("-updated_at")
        )

        # Filter by category if provided
        category_id = self.request.query_params.get("category_id")
        if category_id:
            queryset = queryset.filter(category_id=category_id)

        return queryset


# Authentication endpoints (simple session-based auth)
@api_view(["POST"])
@permission_classes([AllowAny])
def register_view(request):
    """
    Register a new user.
    Expects: username, password, email (optional)
    """
    username = request.data.get("username")
    password = request.data.get("password")
    email = request.data.get("email", "")

    if not username or not password:
        return Response(
            {"error": "Username and password are required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if User.objects.filter(username=username).exists():
        return Response(
            {"error": "Username already exists"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = User.objects.create_user(username=username, password=password, email=email)
    login(request, user)

    return Response(
        {
            "id": user.id,
            "username": user.username,
            "email": user.email,
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def login_view(request):
    """
    Login user with session authentication.
    Expects: username, password
    """
    username = request.data.get("username")
    password = request.data.get("password")

    user = authenticate(request, username=username, password=password)

    if user is not None:
        login(request, user)
        return Response(
            {
                "id": user.id,
                "username": user.username,
                "email": user.email,
            }
        )
    else:
        return Response(
            {"error": "Invalid credentials"},
            status=status.HTTP_401_UNAUTHORIZED,
        )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """Logout current user."""
    logout(request)
    return Response({"message": "Logged out successfully"})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me_view(request):
    """Return current user info."""
    return Response(
        {
            "id": request.user.id,
            "username": request.user.username,
            "email": request.user.email,
        }
    )

