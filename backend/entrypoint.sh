#!/bin/bash
# Don't use set -e here, we want to continue even if seed fails
set +e

# Force unbuffered output
export PYTHONUNBUFFERED=1

# Set database path for persistent storage
# Works for both Railway (/app/data volume) and docker-compose (backend-data:/app/data)
# Falls back to BASE_DIR/db.sqlite3 if DATABASE_PATH not set (local dev)
export DATABASE_PATH=${DATABASE_PATH:-/app/data/db.sqlite3}

# Ensure data directory exists (for volume mounts)
mkdir -p /app/data
chmod 777 /app/data 2>/dev/null || true

# Verify Django is installed
python -c "import django; print('✓ Django', django.__version__, 'is available')" || {
    echo "✗ ERROR: Django is not available!"
    exit 1
}

# Run migrations
python manage.py migrate

# Seed categories and demo user (always runs, idempotent)
python -u manage.py seed_categories

# CRITICAL: Always ensure demo user exists - this MUST run
# Use a Python script file instead of heredoc for better reliability
cat > /tmp/ensure_demo_user.py << 'PYTHON_SCRIPT'
import sys
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth.models import User

print("CRITICAL: Ensuring demo user exists...", file=sys.stderr, flush=True)

# Check database location
from django.conf import settings
db_path = settings.DATABASES['default']['NAME']
print(f"Database path: {db_path}", file=sys.stderr, flush=True)

# Check total users
total = User.objects.count()
print(f"Total users before: {total}", file=sys.stderr, flush=True)

demo_user = User.objects.filter(username='demo').first()

if demo_user:
    print(f"Demo user found (ID: {demo_user.id}), resetting password...", file=sys.stderr, flush=True)
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

total_after = User.objects.count()
print(f"Total users after: {total_after}", file=sys.stderr, flush=True)
print(f"SUCCESS: Demo user verified - Username: {final_check.username}, ID: {final_check.id}", file=sys.stderr, flush=True)
PYTHON_SCRIPT

python -u /tmp/ensure_demo_user.py

EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
    echo "FATAL: User verification failed with exit code $EXIT_CODE!"
    exit 1
fi

# Start server with gunicorn (production-ready)
exec gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 2 --timeout 120 --access-logfile - --error-logfile -

