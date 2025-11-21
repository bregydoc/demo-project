# Backend Dockerfile optimized for uv package manager
FROM python:3.11-slim

# Install system dependencies and uv
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && curl -LsSf https://astral.sh/uv/install.sh | sh

# Add uv to PATH
ENV PATH="/root/.cargo/bin:${PATH}"

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
CMD ["/bin/sh", "-c", "uv run python manage.py migrate && uv run python manage.py seed_categories && uv run python manage.py runserver 0.0.0.0:8000"]

