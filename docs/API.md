# MaintainIQ API Reference

Base URL: `http://localhost:5000/api` (local) or your deployed Render URL + `/api`.

All responses follow: `{ success: boolean, message: string, data: any, meta?: object }` on success, or
`{ success: false, message: string, code: string, details?: [...] }` on error.

Protected routes require `Authorization: Bearer <accessToken>`. The refresh token travels as an httpOnly cookie
(`maintainiq_refresh`) scoped to `/api/auth` — the frontend never touches it directly.

## Auth (`/auth`)

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Creates a **reporter** account (role is never accepted from the client) |
| POST | `/auth/login` | Public | Returns `{ user, accessToken }`, sets refresh cookie |
| POST | `/auth/refresh` | Cookie | Rotates the refresh token, returns a new access token |
| POST | `/auth/logout` | Bearer | Revokes the stored refresh token hash |
| GET | `/auth/me` | Bearer | Current authenticated user |

## Users (`/users`) — Admin only unless noted

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/users` | Admin | Create a staff account with an explicit role |
| GET | `/users` | Admin | List all users |
| GET | `/users/technicians` | Admin, Supervisor | List active technicians (for assignment dropdowns) |

## Assets (`/assets`)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/assets/public/:assetCode` | Public | Safe projection only — name, code, category, location, condition, status, service dates, recent activity |
| POST | `/assets` | Admin | Register an asset — auto-generates `assetCode` + QR public URL |
| GET | `/assets` | Any staff | List with `?search=&status=&category=&location=&technician=&page=&limit=` |
| GET | `/assets/:id` | Any staff | Full asset detail |
| PATCH | `/assets/:id` | Admin | Update fields; `status` is validated against the asset-status transition map; `assetCode` is immutable |
| POST | `/assets/:id/retire` | Admin | Sets status to `Retired` (terminal) |
| GET | `/assets/:id/history` | Any staff | Full history timeline (actor + issue populated) |
| GET | `/assets/:id/qr` | Any staff | `{ url, qrDataUrl }` for inline preview |
| GET | `/assets/:id/qr/download` | Any staff | PNG file download |

## Issues (`/issues`)

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/issues/ai-triage` | Public (rate-limited) | `{ assetCode, complaint }` → Gemini structured suggestion (not persisted) |
| POST | `/issues` | Public (rate-limited), multipart | Create an issue; accepts `evidence` files and optional `aiSuggestion` (for provenance tracking) |
| GET | `/issues/public/:issueNumber` | Public | Status-only lookup, no identity/notes/cost exposed |
| GET | `/issues` | Any staff | List with `?status=&priority=&assetId=&technician=&search=&page=&limit=` |
| GET | `/issues/:id` | Any staff | Full issue detail incl. AI triage provenance |
| PATCH | `/issues/:id/assign` | Admin, Supervisor | `{ technicianId }` |
| PATCH | `/issues/:id/status` | Admin, Supervisor, Technician (own issue only) | `{ status }` — validated against the issue-status transition map; `Resolved` is rejected here (use `/resolve`) |
| PATCH | `/issues/:id/resolve` | Admin, Supervisor, Technician (own issue only) | `{ resolutionSummary }` — requires at least one maintenance record to exist |
| PATCH | `/issues/:id/close` | Admin, Supervisor | Only from `Resolved` |
| PATCH | `/issues/:id/reopen` | Admin, Supervisor | From `Resolved` or `Closed` |

## Maintenance (`/maintenance`)

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/maintenance/issues/:issueId` | Admin, Supervisor, Technician (own issue only), multipart | Notes, parts (`[{name, quantity, cost}]`), `totalCost` (≥0), dates, evidence |
| GET | `/maintenance/issues/:issueId` | Any staff | Records for one issue |
| GET | `/maintenance/assets/:assetId` | Any staff | Records for one asset |

## Dashboard (`/dashboard`)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/dashboard/summary` | Any staff | Asset/issue counts by status, critical/unassigned counts, technician's own open-issue count |

## Error codes worth knowing

`VALIDATION_ERROR`, `INVALID_CREDENTIALS`, `EMAIL_IN_USE`, `TOKEN_INVALID`, `ASSET_NOT_FOUND`, `ISSUE_NOT_FOUND`,
`ASSET_RETIRED`, `INVALID_ASSET_STATUS_TRANSITION`, `INVALID_ISSUE_STATUS_TRANSITION`, `ISSUE_CLOSED`,
`NOT_YOUR_ISSUE`, `MAINTENANCE_NOTE_REQUIRED`, `USE_RESOLVE_ENDPOINT`, `AI_TIMEOUT`, `AI_UNAVAILABLE`,
`AI_INVALID_OUTPUT`, `AI_NOT_CONFIGURED`, `RATE_LIMITED`.
