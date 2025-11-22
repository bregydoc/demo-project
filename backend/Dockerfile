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

# Install dependencies using uv sync (creates .venv)
RUN uv venv && uv sync --frozen || uv sync

# Set PATH to include venv for Railway compatibility (backup for health checks, etc.)
ENV PATH="/app/.venv/bin:$PATH"

# Copy application code
COPY . .

# Create directory for SQLite database
RUN mkdir -p /app/data

# Expose port
EXPOSE 8000

# Run migrations and start server
# Use venv python directly to ensure Django is available
# Railway may run commands outside of PATH, so use absolute path
CMD ["/bin/sh", "-c", "/app/.venv/bin/python manage.py migrate && /app/.venv/bin/python manage.py seed_categories && /app/.venv/bin/python manage.py runserver 0.0.0.0:8000"]

