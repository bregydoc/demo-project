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

# Install dependencies using uv
# --frozen ensures deterministic installs from lock file
# Create venv and sync dependencies
RUN uv venv && uv sync --frozen || uv sync

# Activate virtual environment in PATH for Railway compatibility
ENV PATH="/app/.venv/bin:$PATH"

# Copy application code
COPY . .

# Create directory for SQLite database
RUN mkdir -p /app/data

# Expose port
EXPOSE 8000

# Run migrations and start server
# Using direct python commands since PATH includes venv/bin
CMD ["/bin/sh", "-c", "python manage.py migrate && python manage.py seed_categories && python manage.py runserver 0.0.0.0:8000"]

