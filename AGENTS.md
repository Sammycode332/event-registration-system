# AGENTS.md — Event Registration System Overview & Guide

> **Note for AI Agents**: Always read this file before modifying or extending this codebase. It provides the full architectural blueprint, conventions, database schema, API contracts, frontend routes, and development commands for the project.

---

## 1. Project Overview

The **Event Registration System** is a full-stack, production-grade event discovery and attendee management platform developed for the CodeAlpha Internship.

The system features:
- **Multi-Role Authentication & Authorization**: Supabase Auth combined with a dedicated PostgreSQL `users` table supporting three distinct roles:
  1. `user` (Attendee): Browse events, register for upcoming events, view and manage personal registrations.
  2. `organizer`: Create, edit, and delete their own events; view registration rosters and capacity metrics.
  3. `admin`: Full platform governance (manage all events, update user roles, view global analytics and system statistics).
- **Concurrency-Safe Registrations**: PostgreSQL transaction-level locks (`SELECT ... FOR UPDATE`) to enforce strict capacity limits and prevent double-registration.
- **Modern Full-Stack Stack**:
  - **Backend**: Node.js, Express 5, TypeScript (`tsx`), PostgreSQL (`pg` pool), Supabase Auth.
  - **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, React Router 7.

---

## 2. Directory Structure

```text
codealphaInternshipAssignment/
├── AGENTS.md                     # This reference file
├── README.md                     # Root repository overview
├── SimpleUrlShortner/            # Previous task (URL shortener service)
└── EventRegistration/            # Main project directory
    ├── AGENTS.md                 # Project-specific copy of this file
    ├── README.md                 # Complete system documentation
    ├── package.json              # Backend dependencies and scripts
    ├── tsconfig.json             # Backend TypeScript configuration
    ├── .env                      # Backend environment variables
    ├── .env.example              # Template for environment variables
    ├── compose.yaml              # Optional Docker Compose configuration
    ├── src/
    │   ├── server.ts             # Application entrypoint (starts HTTP listener)
    │   ├── app.ts                # Express app setup, CORS, route mounting
    │   ├── db.ts                 # PostgreSQL connection pool configuration
    │   ├── lib/
    │   │   └── supabase.ts       # Supabase client initialization
    │   ├── middleware/
    │   │   ├── authenticate.ts   # Bearer JWT verification & user profile loader
    │   │   └── authorizeRoles.ts # Role-based access control guard
    │   ├── database/
    │   │   └── migrations/       # SQL migration scripts
    │   │       ├── 001_create_events.sql
    │   │       ├── 002_create_users.sql
    │   │       ├── 003_create_registrations.sql
    │   │       └── 004_add_event_columns.sql
    │   ├── routes/
    │   │   ├── auth.routes.ts          # /auth (register, login, refresh, logout, me)
    │   │   ├── events.routes.ts        # /events (CRUD with ownership & capacity)
    │   │   ├── registrations.routes.ts # /registrations (register, me, cancel, roster)
    │   │   ├── admin.routes.ts         # /admin (stats, users, role updates, upcoming)
    │   │   └── health.routes.ts        # /health check
    │   ├── scripts/
    │   │   └── migrate.ts        # Database migration runner
    │   └── types/
    │       └── express.d.ts      # Express Request & res.locals user type overrides
    └── client/                   # Frontend SPA
        ├── package.json          # Frontend dependencies & scripts
        ├── vite.config.ts        # Vite + Tailwind v4 config
        ├── index.html            # Main HTML document
        ├── src/
        │   ├── main.tsx          # React DOM root with BrowserRouter & AuthProvider
        │   ├── App.tsx           # Route declarations & role guards
        │   ├── index.css         # Global Tailwind CSS imports & base theme
        │   ├── contexts/
        │   │   └── AuthContext.tsx # Centralized authentication context & tokens
        │   ├── components/
        │   │   ├── Navbar.tsx      # Role-aware responsive navigation bar
        │   │   ├── AppLayout.tsx   # Common page container with Navbar and footer
        │   │   ├── EventCard.tsx   # Reusable event card with category badge & details
        │   │   └── ProtectedRoute.tsx # Route guard requiring authentication
        │   ├── pages/
        │   │   ├── HomePage.tsx            # Hero banner, featured event, event previews
        │   │   ├── EventsPage.tsx          # Search, category filter, event cards grid
        │   │   ├── EventDetailsPage.tsx    # Event details, capacity meter & registration CTA
        │   │   ├── LoginPage.tsx           # Login and tabbed registration form
        │   │   ├── DashboardRedirect.tsx   # Redirects users to role-specific dashboards
        │   │   ├── attendee/
        │   │   │   └── AttendeeDashboardPage.tsx # My registrations, tickets & cancellations
        │   │   ├── organizer/
        │   │   │   └── OrganizerDashboardPage.tsx # My events, create/edit, attendee rosters
        │   │   └── admin/
        │   │       ├── AdminDashboardPage.tsx # System metrics, upcoming events, role manager
        │   │       └── AdminEventsPage.tsx    # Global event CRUD operations
        │   └── types/
        │       └── auth.ts                 # Frontend User, Role, and Session types
```

---

## 3. Database Schema

The database uses PostgreSQL hosted on Supabase:

### `users` table
- `id`: `BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY`
- `auth_user_id`: `UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE`
- `name`: `VARCHAR(150) NOT NULL`
- `email`: `VARCHAR(255) NOT NULL UNIQUE`
- `role`: `VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'organizer', 'admin'))`
- `created_at`: `TIMESTAMPTZ NOT NULL DEFAULT NOW()`

### `events` table
- `id`: `BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY`
- `title`: `VARCHAR(200) NOT NULL`
- `description`: `TEXT`
- `location`: `VARCHAR(250) NOT NULL`
- `starts_at`: `TIMESTAMPTZ NOT NULL`
- `capacity`: `INTEGER CHECK (capacity IS NULL OR capacity > 0)`
- `image_url`: `TEXT`
- `category`: `VARCHAR(100)`
- `created_by`: `BIGINT REFERENCES users(id) ON DELETE SET NULL`
- `created_at`: `TIMESTAMPTZ NOT NULL DEFAULT NOW()`

### `registrations` table
- `id`: `BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY`
- `user_id`: `BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE`
- `event_id`: `BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE`
- `created_at`: `TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- `CONSTRAINT registrations_user_event_unique UNIQUE (user_id, event_id)`

---

## 4. API Endpoints Reference

### Authentication (`/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/auth/register` | Public | Sign up new user via Supabase |
| `POST` | `/auth/login` | Public | Sign in with email & password, returns JWT tokens |
| `POST` | `/auth/refresh` | Public | Exchange refresh token for new access token |
| `POST` | `/auth/logout` | Authenticated | Revoke session |
| `GET` | `/auth/me` | Authenticated | Retrieve authenticated user profile from DB |

### Events (`/events`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/events` | Public | List all events (with registration counts) |
| `GET` | `/events/:id` | Public | Get single event details and registration count |
| `POST` | `/events` | Organizer, Admin | Create a new event (`created_by` = current user) |
| `PATCH` | `/events/:id` | Creator, Admin | Update event details |
| `DELETE` | `/events/:id` | Creator, Admin | Delete event |

### Registrations (`/registrations`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/registrations` | Authenticated | Register current user for an event (capacity checked) |
| `GET` | `/registrations/me` | Authenticated | List all events registered by current user |
| `DELETE` | `/registrations/:id` | Authenticated | Cancel personal event registration |
| `GET` | `/registrations/event/:eventId` | Organizer, Admin | View attendee list for a specific event |

### Admin (`/admin`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/admin/stats` | Admin | Platform metrics (total users, events, registrations) |
| `GET` | `/admin/users` | Admin | List all registered users |
| `PATCH` | `/admin/users/:id/role` | Admin | Update user role (`user`, `organizer`, `admin`) |
| `GET` | `/admin/upcoming-events` | Admin | Next 5 scheduled events with counts |

---

## 5. Development & Running Guidelines

### Environment Setup
- **Backend Environment (`EventRegistration/.env`)**:
  ```env
  PORT=3000
  DATABASE_URL=postgres://...
  SUPABASE_URL=https://...
  SUPABASE_ANON_KEY=eyJ...
  ```
- **Frontend Environment (`EventRegistration/client/.env`)**:
  ```env
  VITE_API_URL=http://localhost:3000
  ```

### Commands
- **Backend**:
  - Run development server: `npm run dev`
  - Run migrations: `npm run db:migrate`
  - Typecheck: `npm run typecheck`
- **Frontend**:
  - Run development server: `npm run dev`
  - Build production bundle: `npm run build`
