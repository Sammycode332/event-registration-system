# Eventify — Event Registration Platform

Eventify is a full-stack event discovery and management platform built for the CodeAlpha internship. Visitors can browse events, attendees can reserve and manage tickets, organizers can publish events and view rosters, and administrators can govern the platform.

## Highlights

- Secure email/password authentication through Supabase Auth, with session restoration and token refresh.
- Role-based experiences for attendees, organizers, and administrators.
- Public event discovery with search, category filtering, capacity indicators, and responsive event detail pages.
- Concurrency-safe registrations: database transactions and row-level locks prevent overbooking and duplicate reservations.
- Attendee portal for active and past bookings, plus cancellation.
- Organizer portal for event creation, editing, deletion, capacity tracking, and attendee rosters.
- Admin dashboard for platform metrics, upcoming events, user-role administration, and global event management.
- Responsive dark interface with accessible focus states and mobile navigation.

## Stack

| Area | Tools |
| --- | --- |
| Client | React 19, TypeScript, Vite, React Router 7, Tailwind CSS 4 |
| Server | Node.js, Express 5, TypeScript |
| Data | PostgreSQL via `pg`, Supabase |
| Authentication | Supabase Auth and bearer JWTs |

## Project structure

```text
EventRegistration/
├── client/                    # React single-page application
│   └── src/
│       ├── components/        # Navigation, layout, event cards, guards
│       ├── contexts/          # Auth and session state
│       └── pages/             # Public, attendee, organizer, and admin screens
├── src/
│   ├── database/migrations/   # PostgreSQL schema migrations
│   ├── middleware/            # Authentication and role authorization
│   ├── routes/                # Auth, events, registrations, and admin APIs
│   └── scripts/migrate.ts     # Migration runner
├── .env.example
└── compose.yaml               # Optional local PostgreSQL setup
```

## Local setup

### 1. Configure the server

Install dependencies in `EventRegistration/` and create a `.env` file from `.env.example`. Add the Supabase variables as well:

```env
PORT=3000
DATABASE_URL=postgresql://event_user:YOUR_PASSWORD@localhost:5433/event_registration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
```

```bash
npm install
npm run db:migrate
npm run dev
```

The API runs at `http://localhost:3000`.

### 2. Configure the client

In a separate terminal:

```bash
cd client
npm install
```

Create `client/.env`:

```env
VITE_API_URL=http://localhost:3000
```

Then start the Vite server:

```bash
npm run dev
```

Open the local address Vite prints (normally `http://localhost:5173`).

## Validation commands

Run these before shipping a change:

```bash
# from EventRegistration/
npm run typecheck

# from EventRegistration/client/
npm run lint
npm run build
```

## Deployment

Deploy the API as a **Render Web Service** and the client as a **Vercel project**. The database and authentication service remain on Supabase.

### Render API

- Repository: `Sammycode332/codealpha_tasks`
- Root directory: `EventRegistration`
- Build command: `npm ci && npm run build`
- Start command: `npm start`
- Health-check path: `/health`
- Required environment variables: `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `CLIENT_ORIGIN`

For `DATABASE_URL`, copy the **shared pooler / session mode** connection string from Supabase's **Connect** dialog when your hosting environment is IPv4-only. Set `CLIENT_ORIGIN` to the final Vercel URL (for example, `https://eventify.vercel.app`).

### Vercel client

- Import the same GitHub repository.
- Set the root directory to `EventRegistration/client`.
- Framework preset: Vite.
- Add `VITE_API_URL` with the Render API URL (for example, `https://eventify-api.onrender.com`).
- Deploy again whenever `VITE_API_URL` changes; it is embedded during the client build.

`client/vercel.json` ensures React Router routes work when a visitor opens or refreshes a nested URL directly.

## API at a glance

| Area | Endpoints |
| --- | --- |
| Authentication | `POST /auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout`; `GET /auth/me` |
| Events | `GET /events`, `GET /events/:id`, `POST /events`, `PATCH /events/:id`, `DELETE /events/:id` |
| Registrations | `POST /registrations`, `GET /registrations/me`, `GET /registrations/check/:eventId`, `DELETE /registrations/:id` |
| Organizer | `GET /events/organizer/my-events`, `GET /registrations/event/:eventId` |
| Administration | `GET /admin/stats`, `GET /admin/users`, `PATCH /admin/users/:id/role`, `GET /admin/upcoming-events` |

Protected calls use `Authorization: Bearer <access_token>`. The server remains the authorization boundary; client-side route guards are for navigation and user experience.

## Roles

| Role | Capabilities |
| --- | --- |
| Attendee | Browse events, reserve a place, view and cancel personal registrations. |
| Organizer | Create and manage owned events, inspect attendee rosters. |
| Admin | Manage every event, view analytics, and update user roles. |

## Author

Samuel Adeyemi Oroja — [@Sammycode332](https://github.com/Sammycode332)
