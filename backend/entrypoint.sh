#!/bin/bash
set -e

# Set database path for Railway volume
export DATABASE_PATH=/app/data/db.sqlite3

# Ensure data directory exists (for Railway volume mount)
mkdir -p /app/data

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
python -u manage.py seed_categories || {
    echo "ERROR: Seed command failed!"
    exit 1
}

# Verify demo user was created
echo "Verifying demo user exists..."
python -u manage.py shell -c "
from django.contrib.auth.models import User
user = User.objects.filter(username='demo').first()
if user:
    print(f'✓ Demo user exists: {user.username}')
    print(f'  Active: {user.is_active}')
    if user.check_password('demo'):
        print('  ✓ Password is correct')
    else:
        print('  ✗ Password check failed - resetting password')
        user.set_password('demo')
        user.save()
        print('  ✓ Password reset complete')
else:
    print('✗ ERROR: Demo user does not exist!')
    print('Creating demo user manually...')
    user = User.objects.create_user('demo', 'demo@example.com', 'demo')
    print(f'✓ Created demo user: {user.username}')
" || {
    echo "ERROR: User verification failed!"
    exit 1
}

# Start server with gunicorn (production-ready)
echo "Starting Gunicorn server..."
exec gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 2 --timeout 120 --access-logfile - --error-logfile -

