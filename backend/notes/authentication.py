"""
Custom authentication classes for DRF.
Disables CSRF checking for API endpoints while maintaining session auth.
"""
from rest_framework.authentication import SessionAuthentication


class CsrfExemptSessionAuthentication(SessionAuthentication):
    """
    SessionAuthentication without CSRF check.
    Used for API endpoints where CSRF protection is handled differently.
    """

    def enforce_csrf(self, request):
        """
        Override to skip CSRF check for API endpoints.
        Frontend sends credentials via cookies which is sufficient for our use case.
        """
        return  # Skip CSRF check

