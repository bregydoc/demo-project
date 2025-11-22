#!/bin/bash
set -e

# Set database directory for Railway persistent storage
export DATABASE_DIR=/app/data

# Verify Django is installed
python -c "import django; print(f'✓ Django {django.__version__} is available')" || {
    echo "✗ ERROR: Django is not available!"
    echo "Python path: $(which python)"
    echo "Python version: $(python --version)"
    pip list | grep -i django || echo "Django not found in pip list"
    exit 1
}

# Ensure data directory exists and is writable
mkdir -p /app/data
chmod 777 /app/data

# Run migrations
echo "Running migrations..."
python manage.py migrate

# Seed categories and demo user (always runs, idempotent)
echo "Seeding categories and demo user..."
python manage.py seed_categories

# Verify demo user exists (for debugging)
echo "Verifying demo user..."
python manage.py shell <<EOF
from django.contrib.auth.models import User
user = User.objects.filter(username='demo').first()
if user:
    print(f'✓ Demo user exists: {user.username}')
    print(f'  Active: {user.is_active}')
    print(f'  Email: {user.email}')
    # Test password
    if user.check_password('demo'):
        print('  ✓ Password is correct')
    else:
        print('  ✗ Password check failed')
else:
    print('✗ Demo user does not exist!')
EOF

# Start server with gunicorn (production-ready)
echo "Starting Gunicorn server..."
exec gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 2 --timeout 120 --access-logfile - --error-logfile -

