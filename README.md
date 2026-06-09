# VulnTrack Pro

VulnTrack Pro is a full-stack vulnerability reporting and management platform for organizing security findings, tracking remediation status, and presenting dashboard metrics for an interview or portfolio demo.

This project contains only educational vulnerability examples using localhost or example.com. It does not perform automated attacks.

## Main Features

- Local email/password authentication with bearer session tokens
- Protected React routes
- Vulnerability report CRUD
- Search, severity filter, status filter, and sorting
- Dashboard summary cards and Recharts visualizations
- Report status history
- Copy-as-Markdown, print, and delete confirmation actions
- FastAPI Swagger documentation
- One-command Windows local launcher

## Screenshots

Screenshots can be added after the public Vercel deployment is complete.

## Technology Stack

- Frontend: React, Vite, React Router, Axios, Recharts
- Backend: Python, FastAPI, Uvicorn, Pydantic
- Database: SQLite
- Testing: Pytest
- Deployment target: Render backend and Vercel frontend

## Architecture Flow

```text
React + Vite -> FastAPI REST API -> SQLite
```

The frontend reads `VITE_API_URL` and sends API requests to FastAPI. FastAPI stores users, sessions, reports, and status history in SQLite.

## Public Links

- GitHub repository: Pending deployment
- Live frontend: Pending deployment
- Backend API: Pending deployment
- Swagger documentation: Pending deployment

## Local Setup

Open Command Prompt in the project root and run:

```cmd
run_vulntrack.cmd
```

The launcher creates `backend\venv` if needed, installs backend dependencies when requirements change, installs frontend dependencies when `node_modules` is missing, creates missing local `.env` files, starts FastAPI on `http://localhost:8000`, starts Vite on `http://localhost:5173`, and opens the browser.

Stop the local app:

```cmd
stop_vulntrack.cmd
```

Reset the local SQLite database:

```cmd
reset_database.cmd
```

## Demo Account

- Email: `demo@vulntrack.local`
- Password: `Demo123!`

The demo user and sample reports are seeded automatically. Seeding is idempotent and does not duplicate the standard demo reports.

## Environment Variables

Backend example file: `backend/.env.example`

```env
SESSION_SECRET=
CORS_ORIGINS=http://localhost:5173
ENVIRONMENT=development
```

Frontend example file: `frontend/.env.example`

```env
VITE_API_URL=http://localhost:8000
```

For Render, set `ENVIRONMENT=production`, generate a strong `SESSION_SECRET`, and set `CORS_ORIGINS` to the deployed Vercel frontend URL after the frontend is deployed.

For Vercel, set `VITE_API_URL` to the deployed Render backend URL.

## API Endpoint Overview

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/reports`
- `POST /api/reports`
- `GET /api/reports/{report_id}`
- `PUT /api/reports/{report_id}`
- `PATCH /api/reports/{report_id}/status`
- `DELETE /api/reports/{report_id}`
- `GET /api/dashboard/stats`
- `GET /docs`

## Authentication Flow

Users log in with email and password. Passwords are salted and hashed locally. On successful login, the backend creates a random session token in SQLite. The frontend stores that token in `localStorage` and sends it as `Authorization: Bearer <token>` for protected requests.

## Security Decisions

- `.env` files, SQLite database files, virtual environments, logs, caches, dependency folders, and build output are excluded from Git.
- CORS uses explicit origins and does not use wildcard origins with credentials.
- No real API keys, cloud credentials, private keys, or deployment tokens are stored in source code.
- Demo vulnerability data uses `example.com` and local-only educational examples.
- Users can only access their own reports.

## SQLite Deployment Limitation

This demo uses SQLite. On Render, filesystem storage may be ephemeral depending on the service plan and deployment behavior. If the database file is missing after a restart or redeploy, the backend recreates tables and reseeds the demo account and sample reports automatically. For production use, replace SQLite with a managed relational database after planning the migration.

## Render Backend Deployment

Render can use `render.yaml` from the repository. The backend service should use:

- Root directory: `backend`
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

## Vercel Frontend Deployment

The frontend includes `frontend/vercel.json` so direct navigation to React Router routes such as `/dashboard`, `/reports`, and `/reports/:id` resolves to the SPA entry point.

Use:

- Root directory: `frontend`
- Framework preset: Vite
- Build command: `npm run build`
- Output directory: `dist`

## Interview Screen-Sharing Demo Steps

1. Open the public Vercel frontend.
2. Log in with the demo account.
3. Show dashboard totals, severity chart, status chart, and recent reports.
4. Open All Reports and demonstrate search, severity filter, status filter, and sorting.
5. Create a new report.
6. Open the report detail page.
7. Edit the report.
8. Change the report status and show status history.
9. Copy the report as Markdown and use Print.
10. Delete the report after confirmation.
11. Log out and show protected-route redirect behavior.
12. Open public Swagger documentation.
