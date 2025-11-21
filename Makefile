.PHONY: install dev up down migrate seed clean help

# Default target
.DEFAULT_GOAL := help

help: ## Show this help message
	@echo "Aesthetic Notes App - Available Commands:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

install: ## Install dependencies for both backend and frontend
	@echo "Installing backend dependencies with uv..."
	cd backend && uv venv && uv sync
	@echo ""
	@echo "Installing frontend dependencies..."
	cd frontend && npm install
	@echo ""
	@echo "✓ Installation complete!"

dev: ## Run both backend and frontend locally (without Docker)
	@echo "Starting development servers..."
	@echo "Backend will run on http://localhost:8000"
	@echo "Frontend will run on http://localhost:3000"
	@echo ""
	@trap 'kill 0' EXIT; \
	(cd backend && cp .env.example .env 2>/dev/null || true && uv run python manage.py makemigrations && uv run python manage.py migrate && uv run python manage.py seed_categories && uv run python manage.py runserver) & \
	(cd frontend && npm run dev)

up: ## Start services with Docker Compose
	@echo "Building and starting Docker containers..."
	docker-compose up --build

down: ## Stop Docker Compose services
	@echo "Stopping Docker containers..."
	docker-compose down

migrate: ## Run Django migrations in Docker container
	@echo "Running migrations..."
	docker-compose exec backend uv run python manage.py migrate

seed: ## Seed default categories in Docker container
	@echo "Seeding default categories..."
	docker-compose exec backend uv run python manage.py seed_categories

migrate-local: ## Run Django migrations locally
	@echo "Running migrations locally..."
	cd backend && uv run python manage.py migrate

seed-local: ## Seed default categories locally
	@echo "Seeding default categories locally..."
	cd backend && uv run python manage.py seed_categories

clean: ## Clean up generated files and containers
	@echo "Cleaning up..."
	docker-compose down -v
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".next" -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete 2>/dev/null || true
	find . -type f -name "db.sqlite3" -delete 2>/dev/null || true
	@echo "✓ Cleanup complete!"

test-backend: ## Run backend tests
	cd backend && uv run pytest

lint-backend: ## Lint backend code with ruff
	cd backend && uv run ruff check .

format-backend: ## Format backend code with ruff
	cd backend && uv run ruff format .

lint-frontend: ## Lint frontend code
	cd frontend && npm run lint

logs: ## Show Docker logs
	docker-compose logs -f

shell-backend: ## Open shell in backend container
	docker-compose exec backend /bin/sh

shell-frontend: ## Open shell in frontend container
	docker-compose exec frontend /bin/sh

