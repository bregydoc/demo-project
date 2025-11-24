#!/bin/bash
set -e

# Force unbuffered output
export PYTHONUNBUFFERED=1

# Set database path for Railway volume
export DATABASE_PATH=/app/data/db.sqlite3

# Ensure data directory exists (for Railway volume mount)
mkdir -p /app/data

# Verify Django is installed
echo "=== VERIFYING DJANGO ===" >&2
python -c "import django; print('✓ Django', django.__version__, 'is available')" || {
    echo "✗ ERROR: Django is not available!" >&2
    exit 1
}

# Run migrations
echo "=== RUNNING MIGRATIONS ===" >&2
python manage.py migrate

# Seed categories and demo user (always runs, idempotent)
echo "=== SEEDING CATEGORIES AND DEMO USER ===" >&2
python -u manage.py seed_categories 2>&1 || {
    echo "ERROR: Seed command failed with exit code $?" >&2
    exit 1
}
echo "=== SEED COMMAND COMPLETED ===" >&2

# Verify and ensure demo user exists with detailed logging
echo "=== VERIFYING DEMO USER ===" >&2
python -u manage.py shell << 'PYTHON_EOF'
import sys
import os
os.environ['PYTHONUNBUFFERED'] = '1'

from django.contrib.auth.models import User

print("=" * 60, flush=True)
print("USER VERIFICATION", flush=True)
print("=" * 60, flush=True)

# Check total users
total_users = User.objects.count()
print(f"Total users in database: {total_users}", flush=True)

# List all users
if total_users > 0:
    print("\nAll users in database:", flush=True)
    for u in User.objects.all():
        print(f"  - Username: {u.username}, ID: {u.id}, Active: {u.is_active}, Email: {u.email}", flush=True)

# ALWAYS ensure demo user exists - delete and recreate if needed
print("\nEnsuring demo user exists...", flush=True)
demo_user = User.objects.filter(username='demo').first()

if demo_user:
    print(f"Demo user found: {demo_user.username} (ID: {demo_user.id})", flush=True)
    # Always reset password to ensure it's correct
    demo_user.set_password('demo')
    demo_user.is_active = True
    demo_user.save()
    print("Password reset to 'demo'", flush=True)
else:
    print("Demo user does not exist - creating now...", flush=True)
    try:
        demo_user = User.objects.create_user('demo', 'demo@example.com', 'demo')
        demo_user.is_active = True
        demo_user.save()
        print(f"Created demo user: {demo_user.username} (ID: {demo_user.id})", flush=True)
    except Exception as e:
        print(f"ERROR creating demo user: {e}", flush=True)
        import traceback
        traceback.print_exc(file=sys.stdout)
        sys.stdout.flush()
        sys.exit(1)

# Verify user exists and password works
final_check = User.objects.filter(username='demo').first()
if not final_check:
    print("ERROR: Demo user still does not exist after creation!", flush=True)
    sys.exit(1)

if not final_check.check_password('demo'):
    print("ERROR: Password verification failed!", flush=True)
    sys.exit(1)

print(f"\n✓ SUCCESS: Demo user verified", flush=True)
print(f"  Username: {final_check.username}", flush=True)
print(f"  ID: {final_check.id}", flush=True)
print(f"  Active: {final_check.is_active}", flush=True)
print(f"  Password check: PASSED", flush=True)
print("=" * 60, flush=True)
print("VERIFICATION COMPLETE", flush=True)
print("=" * 60, flush=True)
PYTHON_EOF

EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
    echo "ERROR: User verification failed with exit code $EXIT_CODE!" >&2
    exit 1
fi
echo "=== USER VERIFICATION COMPLETED ===" >&2

# Start server with gunicorn (production-ready)
echo "Starting Gunicorn server..."
exec gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 2 --timeout 120 --access-logfile - --error-logfile -

