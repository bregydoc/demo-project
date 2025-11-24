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
echo "============================================================"
echo "SEEDING CATEGORIES AND DEMO USER"
echo "============================================================"
python -u manage.py seed_categories 2>&1 || {
    echo "ERROR: Seed command failed!"
    exit 1
}
echo "============================================================"

# Verify and ensure demo user exists with detailed logging
echo "============================================================"
echo "VERIFYING DEMO USER"
echo "============================================================"
python -u manage.py shell 2>&1 << 'PYTHON_EOF'
import sys
import os
os.environ['PYTHONUNBUFFERED'] = '1'

from django.contrib.auth.models import User

print("=" * 60)
print("USER VERIFICATION")
print("=" * 60)

# Check total users
total_users = User.objects.count()
print(f"Total users in database: {total_users}", flush=True)

# List all users
if total_users > 0:
    print("\nAll users in database:", flush=True)
    for u in User.objects.all():
        print(f"  - Username: {u.username}, ID: {u.id}, Active: {u.is_active}, Email: {u.email}", flush=True)

# Check demo user
demo_user = User.objects.filter(username='demo').first()
if demo_user:
    print(f"\n✓ Demo user exists: {demo_user.username}", flush=True)
    print(f"  ID: {demo_user.id}", flush=True)
    print(f"  Active: {demo_user.is_active}", flush=True)
    print(f"  Email: {demo_user.email}", flush=True)
    
    # Test password
    password_check = demo_user.check_password('demo')
    print(f"  Password check ('demo'): {password_check}", flush=True)
    
    if not password_check:
        print("  ✗ Password check failed - resetting password", flush=True)
        demo_user.set_password('demo')
        demo_user.save()
        print("  ✓ Password reset complete", flush=True)
        if demo_user.check_password('demo'):
            print("  ✓ Password verification after reset: SUCCESS", flush=True)
        else:
            print("  ✗ ERROR: Password still incorrect after reset!", flush=True)
            sys.exit(1)
    else:
        print("  ✓ Password is correct", flush=True)
else:
    print("\n✗ Demo user does not exist! Creating now...", flush=True)
    try:
        demo_user = User.objects.create_user('demo', 'demo@example.com', 'demo')
        demo_user.save()
        print(f"✓ Created demo user: {demo_user.username}", flush=True)
        print(f"  ID: {demo_user.id}", flush=True)
        print(f"  Active: {demo_user.is_active}", flush=True)
        if demo_user.check_password('demo'):
            print("  ✓ Password verification: SUCCESS", flush=True)
        else:
            print("  ✗ ERROR: Password verification failed after creation!", flush=True)
            sys.exit(1)
    except Exception as e:
        print(f"✗ ERROR creating demo user: {e}", flush=True)
        import traceback
        traceback.print_exc()
        sys.exit(1)

# Final verification
final_check = User.objects.filter(username='demo').first()
if final_check and final_check.check_password('demo'):
    print("\n✓ FINAL VERIFICATION: Demo user exists and password is correct", flush=True)
else:
    print("\n✗ FINAL VERIFICATION FAILED!", flush=True)
    sys.exit(1)

print("=" * 60)
print("VERIFICATION COMPLETE")
print("=" * 60)
PYTHON_EOF

EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
    echo "ERROR: User verification failed with exit code $EXIT_CODE!"
    exit 1
fi
echo "============================================================"

# Start server with gunicorn (production-ready)
echo "Starting Gunicorn server..."
exec gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 2 --timeout 120 --access-logfile - --error-logfile -

