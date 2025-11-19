# Social Media Management System (SMMS) — Project Documentation

> Generated overview describing the repository, architecture, key files, and how to run & maintain the project.

## Project Summary

SMMS (Social Media Management System) is a Node.js + Express web application using SQLite for simple, file-based persistence. It provides user registration/login, role-based access (admin/user), post creation (draft, scheduled, published), image uploads, an auto-publish scheduler, basic analytics, and admin user management.

## Technology Stack

- **Runtime:** Node.js
- **Web framework:** Express
- **Template engine:** EJS (server-side rendering)
- **Database:** SQLite3 (single file `smms.db`)
- **Auth & Security:** `bcrypt` for password hashing, `express-session` for session management, `express-validator` for input validation
- **File upload:** `multer`
- **Dev tooling:** `nodemon` (dev only)

## Quick Start (development)

1. Install dependencies:

```powershell
cd c:\Users\mjeni\OneDrive\Desktop\Software-Engineering-Project
npm install
```

2. Create required directories (if missing):

```powershell
New-Item -ItemType Directory -Path "public\uploads" -Force
New-Item -ItemType Directory -Path "logs" -Force
New-Item -ItemType Directory -Path "backups" -Force
```

3. Start server (production):

```powershell
npm start
```

Or start in dev mode (auto-reload):

```powershell
npm run dev
```

4. Open the app: http://localhost:3000

Default seeded admin credentials (only if DB did not exist when first starting):
- Email: `admin@smms.local`
- Password: `admin123`

## Environment & Configuration

Sensitive and runtime configuration can be set via environment variables. The repository provides runtime checks in `utils/envCheck.js`.

Important variables (examples):

- `PORT` — server port (default `3000`)
- `NODE_ENV` — `development` or `production`
- `SESSION_SECRET` — a long random string (use at least 32 chars)
- `FORCE_HTTPS` — set to `true` in production to enforce HTTPS
- `BCRYPT_ROUNDS` — cost factor for bcrypt (12 recommended)
- `UPLOAD_LIMIT_MB` — max upload size (5 recommended)

If you do not provide a `.env`, sensible defaults are used for development, but configure `SESSION_SECRET` in production.

## Repository Structure and Purpose of Key Files

- `server.js` — Main Express server used by the web app (routes, security headers, session config, scheduler, health endpoints). This file contains the session handling, authorization middleware, and a 10-second auto-publish scheduler for scheduled posts.
- `database.js` — SQLite wrapper: creation of `users`, `posts`, `sessions`, and `audit_logs` tables, plus helper functions `run`, `get`, `all`, and `initialize`. On first run it seeds the default admin user.
- `package.json` — Project metadata, dependencies, and scripts. Notable scripts:
  - `start`: `node server.js`
  - `dev`: `nodemon server.js` (development)
  - `test`: configured to run `pytest -q` (python tests present)
- `README.md` — project README (installation, features, and quick-start details).

Directories:
- `routes/` — Express route modules (e.g., `auth.js`, `posts.js`, `admin.js`, `dashboard.js`, `analytics.js`). The app mounts these with appropriate authentication/authorization middleware.
- `views/` — EJS templates used for server-side pages (login, register, dashboard, admin panels, post forms, error pages).
- `public/` — Static assets like `style.css`, client JS, and `uploads/` (user media)
- `utils/` — Utility modules:
  - `logger.js` — structured file + console logging (info, warn, error, auth, security). Writes logs under `logs/`.
  - `envCheck.js` — environment validation and summary helper.
  - `rateLimiter.js` — login attempt tracking and lockout (brute-force protection).
  - `sanitizer.js` — input sanitation helpers to prevent XSS/SQL injections.
- `backups/` — backup SQL files (may include generated DB backups)
- `tests/` — automated tests (mix of Python and JS tests). There is `auth_test.py`, JS integration/unit tests and setup; test commands may require Python environment for pytest tests.

## Database Schema (high-level)

- `users` table: `id`, `email` (unique), `password_hash`, `role` (`admin`/`user`), `is_active`, `created_at`, `updated_at`.
- `posts` table: `id`, `user_id`, `title`, `content`, `image_path`, `status` (`draft`, `scheduled`, `published`), `scheduled_time`, `published_at`, timestamps.
- `sessions` table: session store (if sessions persisted in DB)
- `audit_logs` table: security/audit events (user actions, IP, user agent)

Notes: The DB is file-based (`smms.db`) and created in the project root by `database.js`.

## Routing & Major Flows

- `routes/auth.js` — registration, login, logout. Implements validation using `express-validator`, password hashing with `bcrypt`, rate limiting, and input sanitation. On registration, it creates a user row; on login, it checks hashed passwords and sets session variables: `userId`, `userEmail`, `userRole`, `loginTime`.
- `routes/posts.js` — (post creation, edit, delete, schedule). Posts support draft/scheduled/published states and optional image uploads via `multer` (uploads saved to `public/uploads`). Scheduled posts use a `scheduled_time` column; `server.js` contains an interval that promotes posts to `published` when the scheduled time is reached.
- `routes/admin.js` — admin-only routes for listing users, deactivating/activating users, promoting/demoting roles, and manually triggering auto-publish operations.
- `routes/dashboard.js` & `routes/analytics.js` — user dashboard and analytics endpoints.

## Security Features

- Password hashing with `bcrypt` (recommended 12 rounds).
- Session management with `express-session`, httpOnly cookies, 15-minute timeout, and rolling sessions.
- Input validation using `express-validator` and custom `sanitizer` functions to avoid XSS/SQL injection.
- Rate limiting for login attempts (configurable via `utils/rateLimiter.js`).
- Security headers applied in `server.js` (CSP, X-Frame-Options, X-XSS-Protection, no-sniff, HSTS in production).

## Scheduler

`server.js` contains a short-interval scheduler (configured to run every 10 seconds) that:

- queries `posts` where `status = 'scheduled'` and `scheduled_time <= now`
- updates matching rows to `status = 'published'` and sets `published_at` timestamp

There is also a debug endpoint at `/debug/scheduler` to inspect and manually trigger scheduler behavior.

## Logging & Backups

- Logs are written by `utils/logger.js` to `logs/smms.log`, `logs/error.log`, and `logs/auth.log`.
- A backup facility exists (see `utils/backup.js` and the `backups/` folder). Backups are stored as SQL dumps; automated/manual backup actions may be exposed via routes or utilities.

## Tests

- The repo contains tests in `tests/` (both Python `pytest` tests and JavaScript tests). `package.json` configures `test` to run `pytest -q`, so you need Python & pytest installed to run all tests. JS tests can be run individually using Node test runners if present.

## Useful Commands

- Install dependencies: `npm install`
- Start server: `npm start`
- Dev (auto-reload): `npm run dev`
- Run Python tests: (from `tests/`) `pytest -q`

## Maintenance & Deployment Notes

- In production, set `NODE_ENV=production`, set a secure `SESSION_SECRET`, enable `FORCE_HTTPS=true`, and configure HTTPS termination (reverse proxy or load balancer).
- Consider moving from file-based SQLite to a managed DB for higher scale (Postgres/MySQL) if concurrency and size increase.
- Rotate and secure log files; configure log rotation or centralized logging for production.

## Where To Look For Specific Tasks

- Add a new API route: `routes/` + corresponding view in `views/` (if server-side)
- Change DB schema: `database.js` (migrations not included — be careful when altering live DB)
- Adjust session timeout or security headers: `server.js`
- Adjust scheduler frequency: `server.js` (setInterval at the bottom)

## Next Steps (recommended)

1. Add a `.env.example` to document required env variables and defaults.
2. Add automated migrations (e.g., using `knex`/`migrate`) if schema will evolve.
3. Add CI (unit tests & linting) and a test script that covers Node tests specifically.
4. Consider storing sessions in a persistent store (Redis) and moving to a managed DB for production.

---

This documentation was generated from repository files (`package.json`, `server.js`, `database.js`, `src/*`, `routes/*`, `utils/*`) to provide an accessible starting point for developers and maintainers.

If you'd like, I can:
- expand the doc with a `CONTRIBUTING.md` and `DEPLOYMENT.md` (production checklist),
- run tests and include results,
- or commit & open a PR with these changes.
