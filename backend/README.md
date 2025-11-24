# Backend - Aesthetic Notes API

Django 5 + DRF backend for the Aesthetic Notes app.

## Deployment (Docker / Railway)

This project uses `runner.py` as the container entrypoint to handle the full startup sequence:

1. Runs database migrations
2. Seeds default categories
3. Ensures the `demo` user exists (password: `demo`)
4. Starts Gunicorn server

**Environment Variables for Production:**

- `DATABASE_PATH`: Path to SQLite DB (e.g., `/app/data/db.sqlite3`)
- `CORS_ALLOWED_ORIGINS`: Comma-separated list of allowed origins (e.g., `https://your-frontend.app`)
- `CSRF_TRUSTED_ORIGINS`: Same as CORS origins (auto-detected if not set)
- `DJANGO_DEBUG`: Set to `False`
- `DJANGO_SECRET_KEY`: Random secret string

**Important:** Ensure `CORS_ALLOWED_ORIGINS` includes your frontend URL (with `https://`) to allow cross-origin session cookies.

## Setup

### With uv (Recommended)

```bash
# Create virtual environment and install dependencies
uv venv
uv sync

# Run migrations
uv run python manage.py migrate

# Seed default categories
uv run python manage.py seed_categories

# Create superuser (optional, for admin access)
uv run python manage.py createsuperuser

# Run development server
uv run python manage.py runserver
```

## API Documentation

See main README.md for full API endpoints.

## Testing

```bash
uv run pytest
```

## Linting & Formatting

```bash
# Lint
uv run ruff check .

# Format
uv run ruff format .
```

