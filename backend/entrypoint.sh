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

# Verify demo user was created with detailed logging
echo "Verifying demo user exists..."
python -u manage.py shell << 'PYTHON_EOF'
import sys
from django.contrib.auth.models import User

print("=" * 60)
print("USER VERIFICATION")
print("=" * 60)

# Check total users
total_users = User.objects.count()
print(f"Total users in database: {total_users}")

# List all users
if total_users > 0:
    print("\nAll users in database:")
    for u in User.objects.all():
        print(f"  - Username: {u.username}, ID: {u.id}, Active: {u.is_active}, Email: {u.email}")

# Check demo user
demo_user = User.objects.filter(username='demo').first()
if demo_user:
    print(f"\n✓ Demo user exists: {demo_user.username}")
    print(f"  ID: {demo_user.id}")
    print(f"  Active: {demo_user.is_active}")
    print(f"  Email: {demo_user.email}")
    print(f"  Is Staff: {demo_user.is_staff}")
    print(f"  Is Superuser: {demo_user.is_superuser}")
    
    # Test password
    password_check = demo_user.check_password('demo')
    print(f"  Password check ('demo'): {password_check}")
    
    if not password_check:
        print("  ✗ Password check failed - resetting password")
        demo_user.set_password('demo')
        demo_user.save()
        print("  ✓ Password reset complete")
        # Verify again
        if demo_user.check_password('demo'):
            print("  ✓ Password verification after reset: SUCCESS")
        else:
            print("  ✗ ERROR: Password still incorrect after reset!")
            sys.exit(1)
    else:
        print("  ✓ Password is correct")
else:
    print("\n✗ ERROR: Demo user does not exist!")
    print("Creating demo user manually...")
    try:
        demo_user = User.objects.create_user('demo', 'demo@example.com', 'demo')
        demo_user.save()
        print(f"✓ Created demo user: {demo_user.username}")
        print(f"  ID: {demo_user.id}")
        print(f"  Active: {demo_user.is_active}")
        if demo_user.check_password('demo'):
            print("  ✓ Password verification: SUCCESS")
        else:
            print("  ✗ ERROR: Password verification failed after creation!")
            sys.exit(1)
    except Exception as e:
        print(f"✗ ERROR creating demo user: {e}")
        sys.exit(1)

print("=" * 60)
print("VERIFICATION COMPLETE")
print("=" * 60)
PYTHON_EOF

if [ $? -ne 0 ]; then
    echo "ERROR: User verification failed!"
    exit 1
fi

# Start server with gunicorn (production-ready)
echo "Starting Gunicorn server..."
exec gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 2 --timeout 120 --access-logfile - --error-logfile -

