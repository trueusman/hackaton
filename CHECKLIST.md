# MaintainIQ — Implementation Checklist (Track A: Advanced Full-Stack + GenAI)

Source: `MaintainIQ_AI_Hackathon_Brief July Coding Night Mern.pdf`. Every mandatory item for Track A is listed below, plus the bonus items we're targeting. Checked off as each module lands.

## Mandatory Scope (Track A)

- [x] Authentication with Admin, Technician, Reporter, Supervisor roles
- [x] Backend-enforced authorization (not just hidden UI buttons)
- [x] Asset registration with unique asset code
- [x] Asset list, details, search, filters, pagination
- [x] Automatic QR generation linked to secure public asset route
- [x] QR preview, downloadable QR/label, copyable public link
- [x] Print-ready asset label (org name, asset name, code, location, QR, scan instruction)
- [x] Public issue-reporting page (no login required, safe fields only)
- [x] Issue assignment + controlled status workflow (invalid transitions blocked)
- [x] Maintenance record: notes, parts, cost, dates, evidence
- [x] Cloudinary cloud media storage for evidence (images/video) — code complete, needs your Cloudinary keys in `.env`
- [x] Permanent, immutable asset history timeline
- [x] AI Issue Triage (Gemini) — structured JSON, human review/edit before save — code complete, needs your Gemini API key in `.env`
- [x] Responsive frontend, dark mode
- [ ] Working deployment (Vercel + Render + MongoDB Atlas) — **configs ready (`render.yaml`, `vercel.json`), not yet deployed — needs your accounts/keys**
- [x] README, API documentation, Postman collection, demo credentials

## Business Rules

- [x] Asset statuses: Operational, Issue Reported, Under Inspection, Under Maintenance, Out of Service, Retired
- [x] Issue statuses: Reported, Assigned, Inspection Started, Maintenance In Progress, Waiting for Parts, Resolved, Closed, Reopened
- [x] Status transition side-effects (issue submitted → asset "Issue Reported", inspection begins → "Under Inspection", etc.)
- [x] Technician can update only issues assigned to them
- [x] Resolved issue can be reopened
- [x] Closed issue cannot be edited until reopened
- [x] Critical issues visually distinguishable
- [x] Issue cannot be resolved without a maintenance note
- [x] Maintenance cost cannot be negative
- [x] Next service date cannot be before completion date
- [x] Duplicate asset codes rejected
- [x] Every important action creates a history record

## QR / Public Page Rules

- [x] QR encodes only the safe public URL (never notes/costs/serials/user info)
- [x] Each QR maps to exactly one asset; editing name/location doesn't break mapping
- [x] Invalid asset identifier → proper not-found state
- [x] Retired asset stays readable, clearly shows Retired
- [x] Public page never exposes technician notes, admin controls, serials, costs, internal attachments, private user details
- [ ] Optional: bulk QR label sheet for multiple assets — *not built, optional innovation item*

## AI (Gemini) Requirements

- [x] AI Issue Triage: input = asset context + complaint + history → output = title, category, priority, possible causes, initial checks, recurring-pattern warning
- [x] Structured JSON output, validated before storing
- [x] Loading, timeout, retry, fallback, error states
- [x] No unsafe electrical/mechanical/fire/medical/industrial instructions; recommend qualified technician for critical issues
- [x] Store whether a field was AI-suggested vs. user-edited
- [x] API key never exposed to frontend
- [ ] Optional AI: maintenance summary, health analysis, preventive recommendation, similar-issue finder — *not built, optional*

## Bonus Targets (max 20 pts)

- [x] Docker + Docker Compose (3 pts) — config written, not runnable in this sandbox (no Docker available here) but standard `docker compose up --build`
- [x] GitHub Actions CI/CD (4 pts) — `.github/workflows/ci.yml` (lint/test backend, build frontend)
- [x] Rate limiting on public/auth/AI/upload endpoints (1 pt)
- [ ] Email notifications (assignment/resolution) (2 pts) — *not built*
- [ ] Redis (justified use only) (3 pts) — *deliberately skipped, see ARCHITECTURE.md §7*
- [ ] AWS deployment (5 pts) — *deliberately skipped in favor of Vercel/Render per agreed stack*

## Submission Requirements

- [x] GitHub repo (FE + BE) — local git initialized with 14 modular commits; **you still need to create the GitHub repo and `git push`**
- [ ] Deployed application link — **you need Vercel/Render accounts to deploy**
- [ ] Backend/API link — same as above
- [x] Demo credentials — see README
- [x] README
- [x] API docs / Postman collection
- [x] Database schema / data-model diagram — see `docs/DATA_MODEL.md`
- [ ] Demo video / LinkedIn link — **you need to record and upload this**

---
*Legend: check items as each module completes. Do not remove items — mark them, don't delete them, so nothing from the brief silently drops.*
