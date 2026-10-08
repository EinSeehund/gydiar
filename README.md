# 🦆🦆🦆 GYDIAR!

**Get your ducks in a row!** Gydiar is a personal task planner: tasks, categories and projects, with a calendar view — built with my own workflow in mind, where every user only ever sees their own data.

![Gydiar](public/gydiar-machine.gif)

## Features

- Tasks with subtasks, categories, projects and due dates
- Calendar view with drag-and-drop rescheduling (FullCalendar)
- Sortable task lists, filterable by category, project or due date
- Email/password login with required email verification, plus GitHub and Google sign-in
- Light/dark theme

## Tech stack

- [Next.js](https://nextjs.org/) 16 (Pages Router), React 19, TypeScript (strict mode)
- [styled-components](https://styled-components.com/) for styling
- [SWR](https://swr.vercel.app/) for data fetching
- [PostgreSQL](https://www.postgresql.org/) via raw, parameterized SQL (no ORM)
- [better-auth](https://www.better-auth.com/) for authentication
- [Resend](https://resend.com/) for transactional emails
- [date-fns](https://date-fns.org/) and [FullCalendar](https://fullcalendar.io/)

## Getting started

### Prerequisites

- Node.js 24+
- A PostgreSQL database (e.g. a free [Neon](https://neon.tech) instance)
- A [Resend](https://resend.com/) account and API key, for sending emails
- OAuth apps for [GitHub](https://github.com/settings/developers) and [Google](https://console.cloud.google.com/apis/credentials), if you want social login

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy the example file and fill in your own values:

```bash
cp .env.example .env.local
```

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | Random secret used to sign sessions (e.g. `openssl rand -hex 32`) |
| `BETTER_AUTH_URL` | Base URL of the app, e.g. `http://localhost:3000` in development |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | GitHub OAuth app credentials |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth app credentials |
| `RESEND_API_KEY` | Resend API key, used to send verification and notification emails |
| `EMAIL_FROM` | *(optional)* sender address; defaults to the Resend onboarding sender |

### 3. Set up the database

There is no migration tool — SQL files are applied by hand, in order, against `DATABASE_URL`.

First, create the authentication tables (`user`, `session`, `account`, `verification`, `rateLimit`). These are managed by better-auth and generated from `src/lib/auth.ts`:

```bash
npx @better-auth/cli migrate
```

Then apply the app's own migrations, which create the `categories`, `projects` and `tasks` tables:

```bash
psql "$DATABASE_URL" -f migrations/000_initial_schema.sql
psql "$DATABASE_URL" -f migrations/001_add_due_date_to_tasks.sql
```

Any future `migrations/*.sql` files should be applied the same way, in filename order.

### 4. Run the app

```bash
npm run dev
```

The app is available at [http://localhost:3000](http://localhost:3000). You'll be redirected to `/login` until you sign up and verify your email (or sign in with GitHub/Google).

## Other commands

```bash
npm run build   # production build
npm run start   # run a production build
npm run lint    # ESLint (flat config, core-web-vitals + typescript)
```

There is no test suite.

## Project structure

```
src/pages/          Pages Router: pages and API routes (src/pages/api/*)
src/lib/            DB pool, session/auth helpers, SWR hooks, validation, dates
src/types/          Shared snake_case types matching the DB schema
components/         One folder per component, at the repo root (not under src/)
migrations/         Hand-applied SQL migrations
```

See [AGENTS.md](AGENTS.md) and [CLAUDE.md](CLAUDE.md) for the full architecture and conventions used across the codebase.

## Contributing

This is a personal project, but pull requests are welcome. Please branch off `main` as `feature/...` and open a PR.
