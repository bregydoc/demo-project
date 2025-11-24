import os
import sys
import subprocess
import time

def log(message):
    """Log to both stdout and stderr for maximum visibility"""
    msg = f"[RUNNER] {message}"
    print(msg, file=sys.stdout, flush=True)
    print(msg, file=sys.stderr, flush=True)

def run_command(command, error_message, exit_on_failure=True):
    log(f"Running: {command}")
    try:
        # Run command and stream output
        process = subprocess.Popen(
            command, 
            shell=True, 
            stdout=sys.stdout, 
            stderr=sys.stderr,
            env=os.environ
        )
        return_code = process.wait()
        
        if return_code != 0:
            log(f"Error: {error_message} (Exit code: {return_code})")
            if exit_on_failure:
                sys.exit(return_code)
            return False
        return True
    except Exception as e:
        log(f"Exception running command: {e}")
        if exit_on_failure:
            sys.exit(1)
        return False

def ensure_demo_user():
    log("=" * 60)
    log("CRITICAL: Verifying/Creating demo user...")
    log("=" * 60)
    
    # Setup Django environment
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
    import django
    django.setup()
    
    from django.contrib.auth.models import User
    from django.conf import settings
    
    try:
        # Log database path
        db_path = settings.DATABASES['default']['NAME']
        log(f"Database path: {db_path}")
        
        # Check total users
        total = User.objects.count()
        log(f"Total users in database: {total}")
        
        # List all users
        if total > 0:
            log("Existing users:")
            for u in User.objects.all():
                log(f"  - {u.username} (ID: {u.id}, Active: {u.is_active})")
        
        # Check user
        user = User.objects.filter(username='demo').first()
        if user:
            log(f"Demo user found (ID: {user.id}). Resetting password...")
            user.set_password('demo')
            user.is_active = True
            user.save()
            log("Password reset to 'demo'")
        else:
            log("Demo user not found. Creating now...")
            user = User.objects.create_user('demo', 'demo@example.com', 'demo')
            user.is_active = True
            user.save()
            log(f"Created demo user: {user.username} (ID: {user.id})")
            
        # Verify
        user = User.objects.get(username='demo')
        if user.check_password('demo'):
            log("✓ Demo user verified successfully")
            log(f"  Username: {user.username}")
            log(f"  ID: {user.id}")
            log(f"  Active: {user.is_active}")
        else:
            log("✗ Demo user password verification failed!")
            sys.exit(1)
            
        # Final count
        final_total = User.objects.count()
        log(f"Total users after: {final_total}")
        log("=" * 60)
            
    except Exception as e:
        log(f"✗ FATAL ERROR ensuring demo user: {e}")
        import traceback
        traceback.print_exc(file=sys.stdout)
        traceback.print_exc(file=sys.stderr)
        sys.exit(1)

def main():
    log("=" * 60)
    log("RUNNER STARTING")
    log("=" * 60)
    
    # Set unbuffered output
    os.environ['PYTHONUNBUFFERED'] = '1'
    
    # Ensure database directory exists
    db_path = os.environ.get('DATABASE_PATH', '/app/data/db.sqlite3')
    log(f"DATABASE_PATH env var: {db_path}")
    db_dir = os.path.dirname(db_path)
    if db_dir and not os.path.exists(db_dir):
        log(f"Creating database directory: {db_dir}")
        os.makedirs(db_dir, exist_ok=True)
        os.chmod(db_dir, 0o777)
    else:
        log(f"Database directory already exists: {db_dir}")

    log("=" * 60)
    log("STEP 1: Running migrations")
    log("=" * 60)
    # 1. Run migrations
    run_command("python manage.py migrate", "Migrations failed")
    
    log("=" * 60)
    log("STEP 2: Seeding categories")
    log("=" * 60)
    # 2. Seed categories (ignore failure)
    run_command("python manage.py seed_categories", "Seeding failed", exit_on_failure=False)
    
    log("=" * 60)
    log("STEP 3: Ensuring demo user exists")
    log("=" * 60)
    # 3. Ensure demo user (Critical)
    ensure_demo_user()
    
    log("=" * 60)
    log("STEP 4: Starting Gunicorn server")
    log("=" * 60)
    # 4. Start Gunicorn
    log("Starting Gunicorn...")
    # Replace current process with Gunicorn
    os.execvp("gunicorn", [
        "gunicorn", 
        "config.wsgi:application", 
        "--bind", "0.0.0.0:8000", 
        "--workers", "2", 
        "--timeout", "120", 
        "--access-logfile", "-", 
        "--error-logfile", "-"
    ])

if __name__ == "__main__":
    main()

