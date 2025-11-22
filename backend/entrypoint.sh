#!/bin/bash
set -e

# Verify Django is installed
python -c "import django; print(f'✓ Django {django.__version__} is available')" || {
    echo "✗ ERROR: Django is not available!"
    echo "Python path: $(which python)"
    echo "Python version: $(python --version)"
    pip list | grep -i django || echo "Django not found in pip list"
    exit 1
}

# Run migrations
echo "Running migrations..."
python manage.py migrate

# Seed categories
echo "Seeding categories..."
python manage.py seed_categories

# Start server
echo "Starting Django development server..."
exec python manage.py runserver 0.0.0.0:8000

