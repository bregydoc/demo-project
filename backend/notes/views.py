"""
API ViewSets using DRF ModelViewSet pattern.
Implements filtering, permissions, and query optimization.
"""

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.db.models import Prefetch
from django.views.decorators.csrf import ensure_csrf_cookie
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
@ensure_csrf_cookie
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
@ensure_csrf_cookie
def login_view(request):
    """
    Login user with session authentication.
    Expects: username, password
    """
    import logging

    logger = logging.getLogger(__name__)

    username = request.data.get("username")
    password = request.data.get("password")

    logger.info(f"Login attempt for username: {username}")
    logger.info(f"Request data keys: {list(request.data.keys())}")
    logger.info(f"Request method: {request.method}")
    logger.info(f"Request path: {request.path}")

    # Check if user exists
    from django.contrib.auth.models import User

    user_exists = User.objects.filter(username=username).exists()
    logger.info(f"User '{username}' exists in database: {user_exists}")

    if user_exists:
        db_user = User.objects.get(username=username)
        logger.info(
            f"User found - ID: {db_user.id}, Active: {db_user.is_active}, Is Staff: {db_user.is_staff}"
        )
        logger.info(f"Password check result: {db_user.check_password(password)}")

    user = authenticate(request, username=username, password=password)
    logger.info(f"Authenticate result: {user is not None}")

    if user is not None:
        logger.info(f"Login successful for user: {user.username} (ID: {user.id})")
        login(request, user)
        logger.info(f"Session created - Session key: {request.session.session_key}")
        return Response(
            {
                "id": user.id,
                "username": user.username,
                "email": user.email,
            }
        )
    else:
        logger.warning(f"Login failed for username: {username}")
        # Additional debugging: check all users
        all_users = User.objects.all()
        logger.info(f"Total users in database: {all_users.count()}")
        for u in all_users:
            logger.info(f"  - User: {u.username}, Active: {u.is_active}")
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
