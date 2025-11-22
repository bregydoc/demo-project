"""
URL configuration for aesthetic notes backend.
"""
from django.contrib import admin
from django.urls import include, path

from notes import views

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("notes.urls")),
    # Add auth endpoints at root level for frontend compatibility
    # Frontend may call /auth/login/ directly if NEXT_PUBLIC_API_URL doesn't include /api
    path("auth/register/", views.register_view, name="register-root"),
    path("auth/login/", views.login_view, name="login-root"),
    path("auth/logout/", views.logout_view, name="logout-root"),
    path("auth/me/", views.me_view, name="me-root"),
]

