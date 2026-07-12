# MaintainIQ

**AI-Powered QR Maintenance & Asset History Platform** — *Scan. Report. Diagnose. Maintain.*

Built for the SMIT Final Hackathon (Track A — Advanced Full-Stack + GenAI). A MERN application that gives every
physical asset a digital identity, a QR-accessible public page, an AI-assisted issue-reporting workflow, controlled
maintenance status transitions, and a permanent audit history.

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full design rationale and [CHECKLIST.md](./CHECKLIST.md) for the
requirement-by-requirement coverage against the hackathon brief.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS, Radix UI primitives (shadcn-style), React Router, Axios, React Hook Form + Zod, TanStack Query, Framer Motion |
| Backend | Node.js, Express.js, MongoDB Atlas, Mongoose |
| Auth | JWT (access + refresh), bcrypt, role-based authorization |
| Uploads | Multer (memory) → Cloudinary |
| AI | Google Gemini (`@google/generative-ai`) |
| QR | `qrcode` |
| Deployment | Frontend → Vercel, Backend → Render, DB → MongoDB Atlas |

## Monorepo layout

```
MaintainIQ/
  client/           React 19 + Vite frontend
  server/           Express + Mongoose backend
  docker-compose.yml  local dev parity (Mongo + server + client)
  render.yaml       Render blueprint for the backend
  .github/workflows/ci.yml  lint/test/build CI
```

## Local setup

### Prerequisites
- Node.js 18+
- A MongoDB connection string (MongoDB Atlas free tier, or a local `mongod`)
- (Optional but required for full functionality) Cloudinary account + Google Gemini API key

### 1. Backend

```bash
cd server
cp .env.example .env      # fill in MONGO_URI, JWT secrets, Cloudinary, Gemini
npm install
npm run seed               # creates demo users + 5 demo assets
npm run dev                 # http://localhost:5000
```

### 2. Frontend

```bash
cd client
cp .env.example .env.local  # VITE_API_URL=http://localhost:5000/api
npm install
npm run dev                  # http://localhost:5173
```

### Demo credentials (created by `npm run seed`)

| Role | Email | Password |
|---|---|---|
| Admin | admin@maintainiq.dev | Admin@12345 |
| Technician | tech@maintainiq.dev | Tech@12345 |
| Supervisor | supervisor@maintainiq.dev | Super@12345 |
| Reporter | reporter@maintainiq.dev | Report@12345 |

## Golden-path demo script

1. Sign in as **admin@maintainiq.dev**, open **Assets**, register an asset (or use a seeded one) — note the QR
   code and public link on the asset detail page.
2. Open the **public link** in a new tab (or scan the QR with a phone) — no login required.
3. Click **Report an Issue**, describe a problem, click **Get AI Suggestion** to see Gemini's structured triage
   (title/category/priority/possible causes/initial checks), edit if needed, submit. Note the issue number shown.
4. Back in the dashboard as admin, open **Issues**, assign the new issue to **tech@maintainiq.dev**.
5. Sign in as the technician, open the issue, move it through **Inspection Started**, add a **maintenance record**
   (notes/parts/cost/dates), then **Resolve** (blocked until a maintenance record exists).
6. Confirm the asset's status flips back to **Operational** and its **History** tab shows the full timeline.
7. Use `/track` (public, no login) with the issue number from step 3 to check its status as an anonymous reporter.

## Environment variables

See [server/.env.example](./server/.env.example) and [client/.env.example](./client/.env.example) for the full list.
Nothing sensitive is committed — `.env` files are gitignored in both apps.

## Testing

```bash
cd server
npm test
```

Uses Jest + Supertest + `mongodb-memory-server` (spins up an ephemeral MongoDB automatically — no setup needed on a
normal machine or in CI). If your environment can't spawn the in-memory `mongod` (some locked-down sandboxes can't),
point tests at a real reachable MongoDB instead:

```bash
TEST_MONGO_URI="mongodb://127.0.0.1:27017/maintainiq_test" npm test
```

Covered business rules: duplicate email/asset-code rejection, invalid issue-status transitions, "no resolution
without a maintenance note," negative maintenance cost rejection, and technician-can-only-touch-their-own-issue
authorization.

## Deployment

### Backend → Render
1. Push this repo to GitHub.
2. In Render, "New Web Service" → connect the repo → root directory `server` (or use the included
   [render.yaml](./render.yaml) blueprint).
3. Set environment variables from `server/.env.example` (Mongo URI, JWT secrets, Cloudinary, Gemini key,
   `CLIENT_URL`/`PUBLIC_APP_URL` pointing at your Vercel domain).
4. Build command `npm install`, start command `node src/server.js`.

### Frontend → Vercel
1. Import the repo in Vercel, set the project root to `client`.
2. Set `VITE_API_URL` to your Render backend's `/api` URL.
3. `vercel.json` already rewrites all routes to `index.html` for client-side routing.

### Database → MongoDB Atlas
1. Create a free M0 cluster, a database user, and allow network access (0.0.0.0/0 for the hackathon, or Render's
   static egress IPs if configured).
2. Use the connection string as `MONGO_URI`.

### Docker (bonus, local dev parity only)

```bash
docker compose up --build
```

Runs Mongo + server (port 5000) + client (port 4173) together. This is **not** the hackathon deployment target
(that's Vercel + Render + Atlas per above) — it exists so the whole stack can be run identically on any machine.

## API documentation

- [docs/API.md](./docs/API.md) — endpoint reference
- [docs/MaintainIQ.postman_collection.json](./docs/MaintainIQ.postman_collection.json) — importable Postman collection

## Security notes

- All role/workflow enforcement happens **server-side** (`protect` + `authorize` middleware, status-transition
  adjacency maps in `constants/`) — the frontend only hides UI as a convenience.
- Refresh tokens are httpOnly cookies, hashed at rest, rotated on every refresh.
- Public routes (`/assets/public/:assetCode`, `/issues` POST, `/issues/ai-triage`, `/issues/public/:issueNumber`)
  use dedicated Mongoose projections so private fields can't leak, plus rate limiting.
- Cloudinary/Gemini/JWT secrets live only in `server/.env`, never sent to the client.
