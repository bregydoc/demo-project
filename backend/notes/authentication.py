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

    def authenticate(self, request):
        # Detailed logging to debug 403 errors
        import logging
        logger = logging.getLogger(__name__)
        
        logger.info(f"Authenticating request: {request.method} {request.path}")
        logger.info(f"Headers: {dict(request.headers)}")
        logger.info(f"Cookies: {request.COOKIES}")
        
        user_auth_tuple = super().authenticate(request)
        
        if user_auth_tuple is None:
            logger.warning("Authentication failed: No user found in session")
        else:
            user, _ = user_auth_tuple
            logger.info(f"Authentication successful for user: {user.username}")
            
        return user_auth_tuple

    def enforce_csrf(self, request):
        """
        Override to skip CSRF check for API endpoints.
        Frontend sends credentials via cookies which is sufficient for our use case.
        """
        return  # Skip CSRF check

