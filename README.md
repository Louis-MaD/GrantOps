# GrantOps — AI-Powered Grant Application Intake Suite

> A full-stack B2B internal operations platform for automating grant application intake, AI-driven eligibility review, risk scoring, and reviewer workflow management.

---

## Product Overview

GrantOps is an internal operations platform designed for nonprofits, university foundations, and government grant offices. It replaces manual spreadsheet-based grant triage with an automated pipeline: applications are ingested, parsed by a mock AI review engine, scored for eligibility and risk, assigned to reviewers, and tracked through an audit-logged workflow.

This project is built to production-style quality — polished SaaS UI, working REST API, real database, realistic seeded data, and a complete reviewer workflow.

---

## Features

- **AI Intake Engine** — paste raw application text and receive an auto-generated executive summary, eligibility score (0–100), risk score (0–100), extracted structured fields, and a list of missing required documents
- **Application Pipeline** — full lifecycle management: New → In Review → Needs Info → Approved / Rejected
- **Reviewer Queue** — Kanban-style board for triaging applications across review stages with inline status and reviewer assignment
- **Audit Trail** — complete, timestamped event log for every system action, AI review, status change, and reviewer note
- **Risk Alerting** — automatic high-risk flagging when applications exceed configurable score thresholds
- **Settings & Permissions** — role-based access control (Admin, Senior Reviewer, Reviewer, Analyst) with configurable automation toggles
- **Dashboard KPIs** — real-time counts for processed applications, pending queue depth, high-risk flags, and AI performance stats
- **Filtering & Search** — filter by status, risk level, and grant program; full-text search across applicant, org, and program fields

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| UI Components | Custom shadcn/ui-style (Radix UI primitives) |
| ORM | Prisma 7 |
| Database | SQLite (via `better-sqlite3` driver adapter) |
| Notifications | Sonner (toast) |
| Icons | Lucide React |
| AI | Mock AI review engine (no API key required) |

---

## Screenshots

> Screenshots taken after running `npm run dev` with seeded data.

### Dashboard
![Dashboard](docs/screenshots/dashboard.png)

### Applications Table
![Applications](docs/screenshots/applications.png)

### Application Detail
![Detail](docs/screenshots/detail.png)

### Reviewer Queue (Kanban)
![Queue](docs/screenshots/queue.png)

### Audit Logs Timeline
![Audit Logs](docs/screenshots/audit-logs.png)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                     Next.js App Router                    │
│                                                           │
│  app/(dashboard)/         app/api/                       │
│  ├── page.tsx (Dashboard) ├── applications/route.ts      │
│  ├── applications/        ├── applications/[id]/route.ts │
│  ├── applications/[id]/   ├── applications/[id]/         │
│  ├── upload/              │   run-review/route.ts        │
│  ├── queue/               ├── audit-logs/route.ts        │
│  ├── audit-logs/          └── reviewers/route.ts         │
│  └── settings/                                           │
└───────────────────┬─────────────────────────────────────┘
                    │
          lib/prisma.ts (Prisma Client + BetterSQLite3 adapter)
                    │
          lib/ai-review.ts (Mock AI Engine)
                    │
          prisma/dev.db (SQLite database)
```

---

## Database Schema

```prisma
model Application {
  id                  String     // CUID primary key
  applicantName       String
  organizationName    String
  grantProgram        String
  requestedAmount     Float
  status              String     // New | In Review | Needs Info | Approved | Rejected
  riskLevel           String     // Low | Medium | High
  eligibilityScore    Int?       // 0–100, AI-generated
  riskScore           Int?       // 0–100, AI-generated
  aiSummary           String?    // AI executive summary paragraph
  rawApplicationText  String?    // Original pasted text
  extractedFields     String?    // JSON: parsed key-value fields
  missingDocuments    String?    // JSON: list of missing doc names
  reviewerNotes       String?
  assignedReviewerId  String?
  createdAt / updatedAt
  → assignedReviewer  Reviewer
  → auditLogs         AuditLog[]
}

model Reviewer {
  id, name, email, role, active
  → applications  Application[]
}

model AuditLog {
  id, applicationId?, actor, action, details, createdAt
  → application  Application?
}
```

---

## AI Review Workflow

The mock AI engine (`lib/ai-review.ts`) processes each application without requiring any external API keys:

1. **Word count analysis** — short applications get lower base eligibility scores
2. **Document detection** — scans text for mentions of required documents (501c3, audits, board lists, etc.)
3. **Program-specific requirements** — each grant program has its own required document checklist
4. **Risk scoring** — elevated by high requested amounts, missing documents, and sparse narratives
5. **Field extraction** — regex-based extraction of timeline, team size, beneficiaries, and geography
6. **Summary generation** — professional paragraph summarizing applicant, mission fit, risk factors, and recommended action

To swap in a real LLM (Claude, GPT-4, etc.), replace `runMockAIReview()` in `lib/ai-review.ts` with an API call — the return type `AIReviewResult` is the contract.

---

## Setup Instructions

### Prerequisites

- Node.js 18+
- npm 9+

### 1. Clone and install

```bash
git clone <repo-url>
cd grantops
npm install
```

### 2. Configure environment

The `.env` file is pre-configured for local SQLite:

```env
DATABASE_URL="file:./dev.db"
```

No other environment variables are required to run locally.

### 3. Initialize the database

```bash
npx prisma migrate dev
```

### 4. Seed with demo data

```bash
npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts
```

Or via the npm script:

```bash
npm run prisma:seed
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Package Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm run start` | Run production server |
| `npm run prisma:generate` | Regenerate Prisma client after schema changes |
| `npm run prisma:migrate` | Run pending migrations |
| `npm run prisma:seed` | Seed the database with demo data |

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `file:./dev.db` | SQLite database file path |

---

## Demo Data

The seed script (`prisma/seed.ts`) creates:

- **12 grant applications** across all 5 programs, all statuses, and all risk levels — with realistic narratives, AI-generated summaries, extracted fields, and missing document lists
- **5 reviewers** (Sarah Chen, Marcus Williams, Dr. Priya Nair, James Okafor, Elena Vasquez) with different roles and active states
- **45 audit log entries** covering the full lifecycle: submission → AI review → assignment → status changes → approvals/rejections

### Grant Programs Included
- Community Health Innovation Fund
- Climate Resilience Microgrant
- STEM Access Fellowship
- Small Business Recovery Grant
- Rural Connectivity Initiative

---

## Future Improvements

- **Real LLM integration** — swap mock AI with Claude or GPT-4 via API (interface is already defined)
- **File upload support** — accept PDF/DOCX uploads with text extraction (Apache Tika, pdf-parse)
- **Email notifications** — Resend or SendGrid integration for reviewer assignments and status changes
- **Authentication** — NextAuth.js with role-based session middleware
- **PostgreSQL migration** — swap SQLite for Postgres in production (one line in Prisma schema)
- **Export** — CSV/PDF export of application pipeline and audit reports
- **Webhook support** — outbound webhooks for external workflow integrations (Zapier, Make)
- **Application form** — public-facing intake form with multi-step wizard

---

## License

MIT
