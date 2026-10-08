@AGENTS.md

# GYDIAR

"Get your ducks in a row!" is a personal task planner where each user sees only their own tasks, categories and projects.

## Commands

- `npm run dev` / `npm run build` / `npm run start`
- `npm run lint` runs ESLint (flat config with `eslint-config-next`, core-web-vitals and typescript).
- There is no test suite.
- There is no migration tool. Apply the SQL files in `migrations/` by hand against `DATABASE_URL`.

## Stack

- Next 16 with the **Pages Router** (`src/pages`), React 19 and the React Compiler (`reactCompiler: true`), TypeScript in strict mode.
- styled-components v6 for styling, with SSR set up in `_document.tsx`. No Tailwind and no UI library.
- SWR for data fetching. Raw `pg` with hand-written, parameterized SQL (no ORM).
- better-auth: email/password with required email verification, plus GitHub and Google OAuth. Resend sends the emails.
- date-fns for dates, `@fullcalendar/react` for `/calendar`, `react-icons` for icons.

## Architecture

- **`components/` lives at the repo root, not in `src/`.** The `@/*` alias only maps to `src/*`, so pages import components with relative paths (`../../components/TaskList/TaskList` from `src/pages/`).
- `src/proxy.ts` is the Next 16 replacement for `middleware.ts`. It redirects to `/login` when there is no better-auth session cookie, and skips `/api`, `_next`, the auth pages and any path containing a dot.
- How data flows:
  1. A page calls a hook from `src/lib/hooks/` (`useTasks(filter)`, `useCategories`, `useProjects`).
  2. The hook fetches with SWR. Its mutation functions read form data from the submit event and call `fetch`.
  3. `useTaskEditor` wraps those mutations, calls `mutate()` and manages the modal state.
  4. The API route in `src/pages/api/*` calls `requireUser(req, res)` from `src/lib/session.ts`.
  5. The route queries the database through `pool` (`src/lib/db.ts`). **Every query is scoped by `user_id`.** Use `ownsRow` and `isUniqueViolation` from `src/lib/db-helpers.ts`.
- API responses have the shape `{ success, tasks | categories | projects | error }`.
- `GET /api/tasks` accepts `?category=`, `?project=`, `?due=` or `?from=&to=`. A recursive CTE returns subtasks too, and `withChildren` (`src/lib/tasks.ts`) nests them.
- `PATCH /api/tasks/[id]` toggles status. Its body is the raw JSON string `"open"` or `"done"`. `PATCH /api/tasks/[id]/due-date` is used for calendar drag-and-drop.
- Tasks are sorted on the client, not in SQL. `TaskList` passes the tasks through `applyTaskView` (`src/lib/taskView.ts`), which is also where future filters should go. The view state lives in the URL query (`?sort=&dir=`) through `useTaskView`. `TaskList` renders `components/TaskSortPanel`, so every page with a task list gets sorting automatically.
- Auth pages use `getServerSideProps = redirectIfAuthenticated`. `_app.tsx` renders `<Navigation>` only when there is a session.
- Theme: an inline script in `_document.tsx` sets `data-theme` on `<html>` from `localStorage.theme` or `prefers-color-scheme`. The CSS variables are in `src/styles/globals.css`, and the switch is `components/ThemeToggle`.

## Conventions

- **Components:** one folder per component (`components/Foo/Foo.tsx`), a default export and a `Props` type. Styled components go at the **bottom** of the file.
- **Pages:** `const X: NextPage = (): JSX.Element`, each with its own `<Head>` title `GYDIAR! - <Page>`. Breakpoints are 600px and 992px.
- **Naming:** DB columns, API payloads and `src/types/*` all use snake_case (`due_date`, `category_id`).
- **Dates:**
  - Send dates to the API as `yyyy-MM-dd` strings and validate them with `parseDueDate` (`src/lib/validation.ts`).
  - SQL selects `due_date::text` to avoid timezone shifts.
  - Format dates for display with `formatDueDate` (`dd.MM.yy`, in `src/lib/dates.ts`).
  - Weeks start on Monday (`weekStartsOn: 1`).
- **Language:** user-facing messages, emails and aria-labels are mostly German. Page titles and buttons are English.
- **Git:** create `feature/...` branches and merge them into `main` through pull requests.

## Environment

Set these in `.env.local` (see `.env.example`): `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `RESEND_API_KEY`. `EMAIL_FROM` is optional and defaults to the Resend onboarding sender.
