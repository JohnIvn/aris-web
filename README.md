# ARIS Website

Frontend for the Accomplishment Report and Information System, built with React, TypeScript, and Vite.

## Development

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env` to configure the data source. The default `VITE_DATA_MODE=demo` uses the seeded records and persists demo changes in browser storage. Set `VITE_DATA_MODE=api` and `VITE_API_BASE_URL` to connect a backend.

## Demo Accounts

| Role | Email | Password |
| --- | --- | --- |
| Administrator | `admin@aris.edu.ph` | `Admin12345` |
| Professor | `professor@aris.edu.ph` | `Professor123` |

## Backend Contract

Sign-in sends `POST /auth/signin` with `{ "email": "...", "password": "..." }`. The server should return `{ "user": { "id": "...", "email": "...", "name": "...", "role": "administrator" | "professor" }, "token": "..." }`; `{ "ok": true, "data": ... }` envelopes are also accepted. The bearer token is attached to later requests.

Page resources are isolated in `src/services/dataSource.ts` and use these routes relative to `VITE_API_BASE_URL`:

| Resource | Method and path |
| --- | --- |
| Admin dashboard | `GET /dashboard` |
| Professors, staff, announcements | `GET /professors`, `GET /staff`, `GET /announcements` |
| Payroll, AI insights, performance | `GET /payroll`, `GET /analytics/insights`, `GET /performance` |
| Approvals, audit, system logs | `GET /approvals`, `GET /audit`, `GET /system/logs` |
| Database backups, checks, restores | `GET /system/database/backups`, `/system/database/health-checks`, `/system/database/restore-logs` |
| Curriculum, monitoring | `GET /curriculum`, `GET /system/monitoring` |
| System settings, preferences | `GET/PUT /system/settings`, `GET/PUT /users/me/preferences` |
| Professor dashboard, submissions, meetings | `GET /professor/dashboard`, `/professor/submissions`, `/professor/submissions/latest`, `/professor/meeting-summaries` |
| Support FAQs | `GET /support/faqs` |
| Create professor, staff, reminder, submission | `POST /professors`, `/staff`, `/announcements`, `/professor/submissions` |

Resource responses may be raw JSON or wrapped as `{ "ok": true, "data": ... }`. Shared page UI components, including `Card`, `StatCard`, and `StatGrid`, live in `src/components/ui.tsx`. Administrator pages are under `src/pages/Admin`; professor pages are under `src/pages/Professor`.

## Validation

```bash
npm run lint
npm run test
npm run build
```
