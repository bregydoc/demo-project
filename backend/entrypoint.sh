#!/bin/bash
set -e

# Verify Django is installed
python -c "import django; print('✓ Django', django.__version__, 'is available')" || {
    echo "✗ ERROR: Django is not available!"
    exit 1
}

# Run migrations
echo "Running migrations..."
python manage.py migrate

# Seed categories and demo user (always runs, idempotent)
echo "Seeding categories and demo user..."
python manage.py seed_categories

# Start server with gunicorn (production-ready)
echo "Starting Gunicorn server..."
exec gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 2 --timeout 120 --access-logfile - --error-logfile -

