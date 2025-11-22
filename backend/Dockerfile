# Backend Dockerfile optimized for uv package manager
FROM python:3.14-slim

# Copy uv binary from official uv Docker image (handles multi-arch automatically)
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

# Verify uv is installed and accessible
RUN uv --version

# Set working directory
WORKDIR /app

# Copy dependency files first for layer caching
COPY pyproject.toml ./

# Install dependencies using uv
# --frozen ensures deterministic installs from lock file
RUN uv venv && uv sync --frozen || uv sync

# Copy application code
COPY . .

# Create directory for SQLite database
RUN mkdir -p /app/data

# Expose port
EXPOSE 8000

# Run migrations and start server
# PATH is set via ENV, so uv should be available
CMD ["/bin/sh", "-c", "uv run python manage.py migrate && uv run python manage.py seed_categories && uv run python manage.py runserver 0.0.0.0:8000"]

