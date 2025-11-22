# Aesthetic Notes App 📝

A beautiful, decoupled note-taking application with category organization and aesthetic pastel colors. Built with Django REST Framework (backend) and Next.js 14 (frontend).

> **🚀 Quick Start:** `make dev` → Visit http://localhost:3000 → Sign up (e.g., `demo` / `demo1234`) → Create notes!  
> **📖 See [DEMO.md](./DEMO.md) for a 30-second quick start guide.**

## Architecture

This is a **monorepo** with a decoupled architecture:

```
aesthetic-notes-app/
├── backend/          # Django 5 + DRF API
├── frontend/         # Next.js 14 (App Router) + TypeScript
├── docker-compose.yml
├── Makefile
└── README.md
```

### Tech Stack

**Backend:**
- Python 3.14+
- Django 5
- Django REST Framework (DRF)
- Package management: `uv`
- Session-based authentication
- SQLite (default, configurable to PostgreSQL)

**Frontend:**
- Next.js 14 (App Router)
- TypeScript (strict mode)
- Tailwind CSS (aesthetic pastel theme)
- TanStack Query (React Query) for data fetching
- Axios for HTTP requests
- React Hook Form for inputs

**Infrastructure:**
- Docker & Docker Compose
- Makefile for common tasks

## Quick Start

### 🎯 Demo Credentials

**IMPORTANT:** The app starts with NO users. You must **Sign Up** (register) first!

**To get started:**
1. Visit http://localhost:3000
2. Click **"Sign up"** (not Sign In!)
3. Create an account with any credentials, for example:
   - Username: `demo`
   - Password: `demo1234`
   - Email: (optional, can leave blank)
4. You'll be automatically logged in and can start creating notes!

**After you've registered**, you can log back in with those same credentials.

### Prerequisites

- Python 3.14+
- Node.js 18+
- Docker & Docker Compose (for containerized setup)
- `uv` (install: `curl -LsSf https://astral.sh/uv/install.sh | sh`)

### Option 1: Local Development (Recommended for Development)

1. **Clone and setup:**

```bash
cd aesthetic-notes-app
make install
```

2. **Configure environment:**

```bash
# Backend
cd backend
cp .env.example .env
# Edit .env with your settings

# Frontend
cd ../frontend
cp .env.example .env
# Edit .env with your settings (NEXT_PUBLIC_API_URL)
```

3. **Run development servers:**

```bash
make dev
```

This will:
- Run migrations
- Seed default categories (Random Thoughts, School, Personal)
- Start backend on `http://localhost:8000`
- Start frontend on `http://localhost:3000`

4. **Create your first account:**

Visit `http://localhost:3000` and click "Sign up" to register. Example credentials:
- Username: `demo`
- Password: `demo1234`

Then start creating beautiful aesthetic notes! ✨

### Option 2: Docker Setup (Production-like)

1. **Start services:**

```bash
make up
```

2. **Run migrations and seed data:**

```bash
make migrate
make seed
```

3. **Access the app:**
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000/api`
- Django Admin: `http://localhost:8000/admin`

4. **Register and start using:**

Go to `http://localhost:3000`, click "Sign up", and create your account. Example:
- Username: `demo`
- Password: `demo1234`

## Available Commands

Run `make help` to see all available commands:

| Command | Description |
|---------|-------------|
| `make install` | Install dependencies for both backend and frontend |
| `make dev` | Run both services locally (without Docker) |
| `make up` | Start services with Docker Compose |
| `make down` | Stop Docker Compose services |
| `make migrate` | Run Django migrations (Docker) |
| `make seed` | Seed default categories (Docker) |
| `make migrate-local` | Run migrations locally |
| `make seed-local` | Seed categories locally |
| `make clean` | Clean up generated files and containers |
| `make logs` | Show Docker logs |
| `make test-backend` | Run backend tests |
| `make lint-backend` | Lint backend with ruff |
| `make format-backend` | Format backend with ruff |

## Features

### ✨ Core Features

- **User Authentication**: Session-based auth with login/register
- **Category Organization**: Pre-seeded aesthetic categories with color coding
  - Random Thoughts (Peach #FFB08F)
  - School (Yellow #FFD966)
  - Personal (Teal #7DD3C0)
- **Note Management**: Full CRUD operations on notes
- **Auto-save**: Debounced auto-save on field blur (500ms)
- **Empty State Handling**: Friendly UI when no notes exist
- **Date Formatting**: Smart date display (Today, Yesterday, Month Day)
- **Filtering**: Filter notes by category
- **Responsive Design**: Mobile-friendly grid layout

### 🎨 Design Philosophy

- Soft pastel aesthetic colors (Peach, Yellow, Teal, Cream)
- Clean, modern UI with smooth transitions
- Custom scrollbars for aesthetic consistency
- Card-based note display with category color borders

## API Endpoints

### Authentication
- `POST /api/auth/register/` - Register new user
- `POST /api/auth/login/` - Login user
- `POST /api/auth/logout/` - Logout user
- `GET /api/auth/me/` - Get current user

### Categories
- `GET /api/categories/` - List all categories with note counts

### Notes
- `GET /api/notes/` - List user's notes (supports `?category_id=X` filter)
- `POST /api/notes/` - Create new note
- `GET /api/notes/{id}/` - Get single note
- `PATCH /api/notes/{id}/` - Update note
- `DELETE /api/notes/{id}/` - Delete note

## Environment Variables

### Backend (`.env`)

```bash
DJANGO_SECRET_KEY=your-secret-key-here
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=sqlite:///db.sqlite3
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

### Frontend (`.env`)

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## Database Models

### Category
- `name` (string, unique)
- `color_hex` (string, 7 chars)
- `slug` (string, auto-generated)
- `created_at` (datetime)

### Note
- `title` (string, max 255 chars)
- `content` (text)
- `category` (FK to Category)
- `owner` (FK to User)
- `created_at` (datetime)
- `updated_at` (datetime, auto)

## Development Guidelines

### Backend

- **Linting**: `make lint-backend` (uses `ruff`)
- **Formatting**: `make format-backend` (uses `ruff`)
- **Testing**: `make test-backend` (uses `pytest`)
- **Migrations**: Always run after model changes

```bash
cd backend
uv run python manage.py makemigrations
uv run python manage.py migrate
```

### Frontend

- **Linting**: `make lint-frontend` (uses ESLint)
- **Type Checking**: TypeScript strict mode enabled
- **Code Style**: Prettier-compatible via ESLint

## Observability

### Logs

- Backend: Structured logs to stdout (JSON-serializable in production)
- Frontend: Console logs in development, structured in production
- Docker logs: `make logs`

### Metrics

- Django admin for user/note/category metrics: `http://localhost:8000/admin`
- React Query DevTools (development only)

### Health Checks

- Backend: `http://localhost:8000/admin/` (basic health)
- Frontend: `http://localhost:3000/` (Next.js health)

## Troubleshooting

### Port conflicts

If ports 3000 or 8000 are in use:

```bash
# Check what's using the port
lsof -i :3000
lsof -i :8000

# Kill the process or change ports in docker-compose.yml
```

### Database issues

Reset the database:

```bash
make clean
make migrate-local  # or make migrate for Docker
make seed-local     # or make seed for Docker
```

### CORS errors

Ensure `CORS_ALLOWED_ORIGINS` in backend `.env` includes your frontend URL:

```bash
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

### Docker build fails

Clear Docker cache and rebuild:

```bash
docker-compose down -v
docker system prune -a
make up
```

## Project Structure

```
aesthetic-notes-app/
├── backend/
│   ├── config/              # Django project settings
│   ├── notes/               # Notes app
│   │   ├── models.py        # Category, Note models
│   │   ├── serializers.py   # DRF serializers
│   │   ├── views.py         # API ViewSets
│   │   ├── urls.py          # API routes
│   │   └── management/
│   │       └── commands/
│   │           └── seed_categories.py
│   ├── manage.py
│   ├── pyproject.toml       # uv dependencies
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js App Router
│   │   │   ├── auth/        # Auth page
│   │   │   ├── dashboard/   # Dashboard page
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── components/      # React components
│   │   │   ├── Sidebar.tsx
│   │   │   ├── NoteCard.tsx
│   │   │   └── NoteModal.tsx
│   │   └── lib/             # API client, hooks, utils
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   └── Dockerfile
├── docker-compose.yml
├── Makefile
└── README.md
```

## License

MIT

## Contributing

1. Create a feature branch
2. Make your changes
3. Run linters and tests
4. Submit a pull request

---

**Built with ❤️ using Django, Next.js, and aesthetic design principles.**

