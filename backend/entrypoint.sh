#!/bin/bash
set -e

# Force unbuffered output
export PYTHONUNBUFFERED=1

# Set database path for Railway volume
export DATABASE_PATH=/app/data/db.sqlite3

# Ensure data directory exists (for Railway volume mount)
mkdir -p /app/data

# Verify Django is installed
echo "=== VERIFYING DJANGO ==="
python -c "import django; print('✓ Django', django.__version__, 'is available')" || {
    echo "✗ ERROR: Django is not available!"
    exit 1
}

# Run migrations
echo "=== RUNNING MIGRATIONS ==="
python manage.py migrate
echo "=== MIGRATIONS COMPLETED ==="

# Seed categories and demo user (always runs, idempotent)
python -u manage.py seed_categories || echo "WARNING: Seed command had issues, but continuing..."

# CRITICAL: Always ensure demo user exists - this is the fallback
python -u manage.py shell << 'PYTHON_EOF'
import sys
import os
os.environ['PYTHONUNBUFFERED'] = '1'

from django.contrib.auth.models import User

# CRITICAL: Always ensure demo user exists
print("CRITICAL: Ensuring demo user exists...", file=sys.stderr, flush=True)

demo_user = User.objects.filter(username='demo').first()

if demo_user:
    print(f"Demo user found, resetting password...", file=sys.stderr, flush=True)
    demo_user.set_password('demo')
    demo_user.is_active = True
    demo_user.save()
else:
    print("Demo user NOT found, creating now...", file=sys.stderr, flush=True)
    try:
        demo_user = User.objects.create_user('demo', 'demo@example.com', 'demo')
        demo_user.is_active = True
        demo_user.save()
        print(f"Created demo user: {demo_user.username} (ID: {demo_user.id})", file=sys.stderr, flush=True)
    except Exception as e:
        print(f"FATAL ERROR creating demo user: {e}", file=sys.stderr, flush=True)
        import traceback
        traceback.print_exc(file=sys.stderr)
        sys.stderr.flush()
        sys.exit(1)

# Verify
final_check = User.objects.filter(username='demo').first()
if not final_check:
    print("FATAL: Demo user still missing after creation!", file=sys.stderr, flush=True)
    sys.exit(1)

if not final_check.check_password('demo'):
    print("FATAL: Password verification failed!", file=sys.stderr, flush=True)
    sys.exit(1)

print(f"SUCCESS: Demo user verified - Username: {final_check.username}, ID: {final_check.id}", file=sys.stderr, flush=True)
PYTHON_EOF

EXIT_CODE=$?
echo "Verification script exit code: $EXIT_CODE"
if [ $EXIT_CODE -ne 0 ]; then
    echo "ERROR: User verification failed with exit code $EXIT_CODE!"
    exit 1
fi
echo "=== USER VERIFICATION COMPLETED ==="

# Start server with gunicorn (production-ready)
echo "Starting Gunicorn server..."
exec gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 2 --timeout 120 --access-logfile - --error-logfile -

