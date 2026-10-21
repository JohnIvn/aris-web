# ARIS Web Admin

Administrator website for the Accomplishment Report and Information System, built with React, TypeScript, and Vite. The professor and staff desktop app remains in the separate `ARIS-App` repository.

## Development

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env` to configure the data source. The default `VITE_DATA_MODE=demo` uses the seeded records and persists demo changes in browser storage. Set `VITE_DATA_MODE=api` and `VITE_API_BASE_URL` to connect a backend.

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
