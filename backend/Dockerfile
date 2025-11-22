# Backend Dockerfile optimized for uv package manager
FROM python:3.14-slim

# Copy uv binary from official uv Docker image (handles multi-arch automatically)
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

# Verify uv is installed and accessible
RUN uv --version

# Set working directory
WORKDIR /app

# Copy dependency files first for layer caching
COPY pyproject.toml uv.lock* ./

# Install dependencies system-wide using uv pip install for Railway compatibility
# Railway runs commands using system Python, so we need Django available globally
# First try to install from lock file, fallback to direct install from pyproject.toml
RUN uv pip install --system --no-cache django>=5.0,<6.0 djangorestframework>=3.14.0 django-cors-headers>=4.3.0 python-dotenv>=1.0.0

# Copy application code
COPY . .

# Create directory for SQLite database
RUN mkdir -p /app/data

# Expose port
EXPOSE 8000

# Run migrations and start server
# Using system python since dependencies are installed globally
CMD ["/bin/sh", "-c", "python manage.py migrate && python manage.py seed_categories && python manage.py runserver 0.0.0.0:8000"]

