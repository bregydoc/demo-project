# Backend Dockerfile optimized for uv package manager
FROM python:3.14-slim

# Copy uv binary from official uv Docker image (handles multi-arch automatically)
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

# Verify uv is installed and accessible
RUN uv --version

# Set working directory
WORKDIR /app

# Copy dependency files first for layer caching
COPY pyproject.toml uv.lock* requirements.txt ./

# Install dependencies system-wide using pip for Railway compatibility
# Railway runs commands using system Python, so we need Django available globally
# Use requirements.txt for reliable installation
RUN pip install --no-cache-dir -r requirements.txt

# Verify Django is installed and accessible
RUN python -c "import django; print(f'Django {django.__version__} installed successfully')"

# Copy application code
COPY . .

# Create directory for SQLite database
RUN mkdir -p /app/data

# Expose port
EXPOSE 8000

# Run migrations and start server
# Using system python since dependencies are installed globally
CMD ["/bin/sh", "-c", "python manage.py migrate && python manage.py seed_categories && python manage.py runserver 0.0.0.0:8000"]

