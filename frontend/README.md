# Frontend - Aesthetic Notes

Next.js 16 frontend for the Aesthetic Notes app with island architecture for optimal streaming UX.

## Setup

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env to point to your backend API
# In Production (Railway), this MUST start with https:// for cookies to work
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# Run development server
npm run dev
```

## Building

```bash
npm run build
npm start
```

## Linting

```bash
npm run lint
```

## Tech Stack

- Next.js 16 (App Router with Partial Prerendering)
- React 19
- TypeScript (strict)
- Tailwind CSS
- TanStack Query
- Axios
- React Hook Form

## Architecture

This app uses **Island Architecture** for optimal streaming UX:

- **Island Components**: Client components are dynamically imported with `ssr: false` to create isolated "islands" that hydrate independently
- **Suspense Boundaries**: Used throughout for progressive streaming of UI components
- **Loading States**: Custom loading skeletons for better perceived performance
- **Server Components**: Static parts rendered on the server, dynamic islands hydrate on the client

### Island Components

- `SidebarIsland`: Category navigation and logout
- `NotesGridIsland`: Notes list with filtering
- `NoteModalIsland`: Note editing modal

These islands stream independently, allowing the UI to appear faster and more responsive.

