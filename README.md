# ARIS Web Admin

Administrator website for the Accomplishment Report and Information System, built with React, TypeScript, and Vite. The professor and staff desktop app remains in the separate `ARIS-App` repository.

## Development

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env` to connect the web app to the ARIS API. Local Vite development defaults to `http://localhost:3000`, where the Nest server reads administrator accounts from the database. Set `VITE_API_BASE_URL` to override the backend URL. Railway supplies the production URL during the Docker build. Set `VITE_DATA_MODE=demo` only when intentionally using the local demo data.

Support tickets use the server's `/support/tickets` API. Set
`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the web deployment to
enable Supabase Realtime updates for new tickets and replies. The server adds
the ticket tables to the `supabase_realtime` publication during startup.

## Client Downloads

The `/downloads` page reads the newest published builds from GitHub Releases instead of hard-coded values:

| Client | Repository | Asset picked |
| --- | --- | --- |
| ARIS Desktop (Windows) | `UnexpectedFeatures/aris-app` | `*-setup.exe` (MSI offered as an alternate) |
| ARIS Mobile (Android) | `JohnIvn/aris-mobile` | `*.apk` (IPA offered as an alternate) |

The GitHub REST API is called directly from the browser and results are cached in `localStorage` for an hour. Unauthenticated calls are limited to 60 requests per hour per IP, so the page falls back to the last known good build (with a "Last known build" badge and retry action) when the API is rate limited or unreachable.

Optional environment overrides:

| Variable | Purpose |
| --- | --- |
| `VITE_GITHUB_DESKTOP_REPO` | Repository serving the desktop installer |
| `VITE_GITHUB_MOBILE_REPO` | Repository serving the mobile APK |
| `VITE_GITHUB_TOKEN` | Read-only token that raises the API limit to 5,000 requests/hour |
| `VITE_GITHUB_API_BASE` | API base URL (e.g. a caching proxy); defaults to `https://api.github.com` |

## Demo Accounts

| Role | Email | Password |
| --- | --- | --- |
| Administrator | `admin@ucc.edu.ph` | `Admin12345` |

## Backend Contract

Sign-in sends `POST /auth/signin` with `{ "email": "...", "password": "..." }`. The server should return `{ "user": { "id": "...", "email": "...", "name": "...", "role": "administrator" }, "token": "..." }`; `{ "ok": true, "data": ... }` envelopes are also accepted. The bearer token is attached to later requests.

Page resources are isolated in `src/services/dataSource.ts` and use these routes relative to `VITE_API_BASE_URL`:

| Resource | Method and path |
| --- | --- |
| Admin dashboard | `GET /dashboard` |
| Professors, staff, announcements | `GET /professors`, `GET /staff`, `GET /announcements` |
| Payroll and AI insights | `GET /payroll`, `GET /analytics/insights` |
| Approvals, audit, system logs | `GET /approvals`, `GET /audit`, `GET /system/logs` |
| Database backups, checks, restores | `GET /system/database/backups`, `/system/database/health-checks`, `/system/database/restore-logs` |
| System settings, preferences | `GET/PUT /system/settings`, `GET/PUT /users/me/preferences` |
| Create professor, staff, and reminders | `POST /professors`, `/staff`, `/announcements` |

Resource responses may be raw JSON or wrapped as `{ "ok": true, "data": ... }`. Shared page UI components, including `Card`, `StatCard`, and `StatGrid`, live in `src/components/ui.tsx`. Administrator pages are under `src/pages/Admin`.

## Validation

```bash
npm run lint
npm run test
npm run build
```
