"""
URL routing for notes API.
Registers ViewSet routers and auth endpoints.
"""
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r"categories", views.CategoryViewSet, basename="category")
router.register(r"notes", views.NoteViewSet, basename="note")

urlpatterns = [
    # Auth endpoints
    path("auth/register/", views.register_view, name="register"),
    path("auth/login/", views.login_view, name="login"),
    path("auth/logout/", views.logout_view, name="logout"),
    path("auth/me/", views.me_view, name="me"),
    # ViewSet routes
    path("", include(router.urls)),
]

