# Event Registration System

A full-stack event management application built with **Express, TypeScript, React, and Supabase**. The project is being developed as part of my CodeAlpha internship and is designed around authenticated users, role-based permissions, and event management.

> **Project status:** The backend authentication and event-management API are implemented. The frontend currently includes the event discovery experience, event detail pages, login, session restoration, and protected routes. The remaining frontend work includes connecting event pages and registration flows to the live API and completing role-specific dashboards.

## Features

### Backend
- User registration and login using Supabase Authentication.
- Access-token verification and application-user profile lookup.
- Refresh-token endpoint for renewing expired access tokens.
- Logout endpoint and server-side authentication middleware.
- Role-based access control for `user`, `organizer`, and `admin` roles.
- Event API supporting listing, retrieving, creating, updating, and deleting events.
- Organizer ownership checks for event management, with admin-level management access.
- PostgreSQL data storage through the `pg` client and Supabase database.

### Frontend
- Responsive event discovery homepage and featured event cards.
- Events listing with text search and category filtering.
- Dynamic event detail pages using route parameters.
- Login form with loading, success, and error states.
- Show/hide password control.
- Shared authentication state through React Context.
- Session restoration when the app reloads, including an attempt to refresh an expired access token.
- Protected routes that redirect unauthenticated visitors to the login page.
- Dark interface styled with Tailwind CSS.

**Implementation note:** Event listing and detail pages currently use sample frontend data. Connecting these screens to the existing backend event endpoints and completing the attendee registration interface are still in progress. The frontend route guard improves navigation flow; backend authentication and authorization remain responsible for protecting API resources.

## Tech Stack

| Area | Technologies |
|---|---|
| Backend | Node.js, Express 5, TypeScript |
| Authentication | Supabase Auth |
| Database | PostgreSQL, Supabase, `pg` |
| Frontend | React, TypeScript, Vite |
| Routing | React Router |
| Styling | Tailwind CSS v4 |
| API communication | Fetch API |

## Project Structure

The frontend is located in the `client/` directory alongside the backend project.

```text
EventRegistration/
├── client/                 # React + TypeScript frontend
│   └── src/
│       ├── components/     # Reusable UI and route components
│       ├── context/        # Shared authentication state
│       ├── data/           # Current sample event data
│       ├── pages/          # Home, events, details, login and register pages
│       └── types/          # Frontend TypeScript types
├── src/                    # Express + TypeScript backend
│   ├── lib/                # Supabase client
│   ├── middleware/         # Authentication and authorization middleware
│   ├── routes/             # API routes
│   └── ...                 # Database and application setup
└── README.md
```

## Getting Started

### Prerequisites
- Node.js and npm
- A Supabase project with Authentication enabled
- A PostgreSQL database configured for the backend

### 1. Clone the repository

```bash
git clone https://github.com/Sammycode332/event-registration-system.git
cd event-registration-system
```

### 2. Configure the backend

Create a `.env` file in the backend root and provide the Supabase and PostgreSQL configuration required by the backend.

Check `src/lib/supabase.ts` and `src/db.ts` for the exact environment-variable names expected by the project. Keep real credentials in `.env`; never commit that file to Git.

Install backend dependencies and start the development server using the scripts defined in the root `package.json`:

```bash
npm install
npm run dev
```

The backend development server is configured to run at:

```text
http://localhost:3000
```

### 3. Configure and run the frontend

In a second terminal:

```bash
cd client
npm install
```

Create `client/.env` and set the backend API base URL:

```env
VITE_API_URL=http://localhost:3000
```

Start the Vite development server:

```bash
npm run dev
```

Open the local URL printed by Vite (typically `http://localhost:5173`).

## API Overview

The backend exposes the following routes:

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/auth/register` | Register a user |
| `POST` | `/auth/login` | Sign in and receive session tokens |
| `POST` | `/auth/refresh` | Exchange a refresh token for updated tokens |
| `POST` | `/auth/logout` | Sign out the authenticated user |
| `GET` | `/auth/me` | Get the authenticated application-user profile |
| `GET` | `/events` | List events |
| `GET` | `/events/:eventId` | Get an event by ID |
| `POST` | `/events` | Create an event (role-restricted) |
| `PATCH` | `/events/:eventId` | Update an event (owner/admin rules apply) |
| `DELETE` | `/events/:eventId` | Delete an event (owner/admin rules apply) |

Protected endpoints require a bearer access token in the `Authorization` header:

```http
Authorization: Bearer <access_token>
```

## Authentication and Authorization

Supabase Auth handles user credentials and issues session tokens. The Express authentication middleware verifies the access token and loads the corresponding application profile from PostgreSQL. The application profile contains the user's ID, name, email, and role.

The supported application roles are:

- **User:** attendee-level access.
- **Organizer:** can manage events they own.
- **Admin:** administrative access, including managing events across the platform.

Frontend route protection is for the user experience only. Authorization checks on the backend are the security boundary for protected operations.

## Current Development Focus

- Connect event discovery and event details to the live events API.
- Complete attendee event registration and registration management in the frontend.
- Add role-aware navigation and dashboards for users, organizers, and admins.
- Complete password recovery and authenticated password-change flows.
- Improve API request handling, including refreshing access tokens when protected API requests fail due to token expiry.

## Author

**Samuel Adeyemi Oroja**  
GitHub: [@Sammycode332](https://github.com/Sammycode332)