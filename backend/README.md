# Backend - Aesthetic Notes API

Django 5 + DRF backend for the Aesthetic Notes app.

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

