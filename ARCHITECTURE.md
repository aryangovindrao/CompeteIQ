# CompeteIQ — Architecture

A complete map of the codebase, organized by responsibility. Read this when you join the project, when you need to find a file, or when you need to reason about a change.

---

## 1. High-level system

```
┌───────────────────────────────────────────────────────────────────────┐
│                          Next.js 14 App Router                        │
│                       (single deploy on Vercel)                       │
│                                                                       │
│   ┌──────────────┐      ┌──────────────┐      ┌──────────────────┐    │
│   │  Frontend    │ ───▶ │  API routes  │ ───▶ │  Prisma client   │    │
│   │  (RSC + CSR) │ ◀─── │  (Node)      │ ◀─── │                  │    │
│   └──────────────┘      └──────┬───────┘      └────────┬─────────┘    │
│                                │                       │              │
└────────────────────────────────┼───────────────────────┼──────────────┘
                                 │                       │
                                 │                       ▼
                                 │              ┌────────────────┐
                                 │              │  Postgres (Neon)│
                                 │              └────────────────┘
                                 ▼
   ┌────────────┬───────────┬──────────┬──────────┬──────────┬───────┐
   │  Stripe    │  Resend   │  Groq    │  OpenAI  │  R2      │ Redis │
   │ (payments) │ (email)   │  (LLM)   │  (LLM)   │ (files)  │ (RL)  │
   └────────────┴───────────┴──────────┴──────────┴──────────┴───────┘
```

Everything lives in **one codebase**. Each external service activates when its env vars are set; otherwise the app falls back gracefully (templated questions, console-logged emails, in-memory rate limits, etc.).

---

## 2. Top-level directory layout

```
pj4/
├── .env.example              # Documented template — every var explained
├── .gitignore                # Excludes secrets, build artifacts, deps
├── README.md                 # Quick start for humans
├── ARCHITECTURE.md           # This file
├── package.json              # Scripts + deps (build runs prisma generate)
├── tsconfig.json             # TS config with @/* → ./src/*
├── tailwind.config.ts        # Design tokens (primary, tier colors, etc.)
├── next.config.js
├── postcss.config.js
│
├── prisma/                   # Database
│   ├── schema.prisma         # 17 models, 11 enums, relations + indexes
│   └── seed.ts               # Bootstraps demo data
│
└── src/
    ├── middleware.ts         # Route guard (cookie-based JWT check)
    ├── app/                  # Next.js App Router
    ├── components/           # React components, organized by feature
    └── lib/                  # Shared TS — types, helpers, hooks, server libs
```

---

## 3. Frontend layer

### 3.1 Pages (Next.js routes)

All under `src/app/`. Three route groups for visual + auth separation:

```
src/app/
├── layout.tsx                # Root <html> + <Providers>
├── auth/callback/page.tsx    # OAuth hydration (cookie → localStorage)
├── verify/[id]/page.tsx      # PUBLIC certificate verification (no auth)
│
├── (marketing)/              # Public — marketing site chrome
│   ├── layout.tsx
│   ├── page.tsx              # Homepage
│   ├── about/page.tsx
│   └── pricing/page.tsx
│
├── (auth)/                   # No-chrome auth flows
│   ├── layout.tsx
│   ├── login/page.tsx        # Email/pw + "Sign in with Google"
│   ├── register/page.tsx
│   ├── forgot-password/page.tsx
│   ├── reset-password/page.tsx
│   └── join/page.tsx
│
└── (dashboard)/              # Authenticated — sidebar + topbar shell
    ├── layout.tsx
    ├── dashboard/page.tsx          # Role-aware home
    ├── profile/page.tsx
    ├── profile/[userId]/page.tsx
    ├── classes/page.tsx
    ├── classes/[id]/page.tsx
    ├── competitions/page.tsx
    ├── competitions/[id]/page.tsx
    ├── competitions/[id]/attempt/page.tsx
    ├── competitions/[id]/results/page.tsx
    ├── leaderboard/page.tsx
    ├── certificates/page.tsx
    ├── students/page.tsx           # Staff only
    ├── teachers/page.tsx           # Admin only
    ├── billing/page.tsx            # Admin only
    └── ai-generator/page.tsx       # Staff only
```

### 3.2 Components

Organized **by feature**, with shared primitives in `ui/` and chrome in `layout/`.

```
src/components/
├── ui/                       # Design-system primitives (reusable everywhere)
│   ├── Button.tsx (+ LinkButton)
│   ├── Input · Textarea · Select · Checkbox · Slider · OtpInput
│   ├── Modal · Tabs (+ PillTabs)
│   ├── Card · Panel
│   ├── Badge (+ DifficultyBadge) · Avatar · JoinCode
│   ├── Progress (+ CircularProgress)
│   ├── Skeleton · Spinner · EmptyState
│   └── Sparkline · TrendChip · LiveIndicator · Tooltip
│
├── layout/                   # App chrome
│   ├── DashboardShell.tsx    # Sidebar + topbar + outlet
│   ├── Sidebar · Topbar · MobileDrawer
│   ├── MarketingNav · MarketingFooter
│   ├── Logo · PageTransition
│   └── nav-config.ts         # Role-gated navigation map
│
├── marketing/                # Homepage building blocks
│   ├── Hero · Features · HowItWorks
│   ├── GamificationShowcase · StatsStrip · LogoStrip
│   ├── PricingPlans.tsx      # Reused on /pricing AND /billing
│   └── Section · DarkSection · CTASection
│
├── dashboard/                # Home-page widgets + shared
│   ├── PageHeader · Panel (+ PanelLink)
│   ├── StatGrid · Charts (Activity / Skill / ScoreDist)
│   ├── HomeWidgets           # Results · Upcoming · QuickActions · Activity
│   ├── XpProgressCard
│   ├── Badges                # BadgeTile + BadgesGrid + tierMeta
│   └── CertificateCard
│
├── profile/                  # ProfileView · ProfileHeader · EditProfileModal
├── classes/                  # ClassesView · ClassDetailView · ClassCard · CreateClassModal
├── competitions/             # ListView · DetailView · CardView · AttemptView · ResultsView
├── leaderboard/              # LeaderboardView
├── certificates/             # CertificatesView
├── students/                 # StudentsView          (staff)
├── teachers/                 # TeachersView          (admin, + InviteTeacherModal)
├── billing/                  # BillingView           (admin, + Stripe checkout)
├── ai/                       # AiGeneratorView       (staff, 4-step wizard)
└── gamification/             # RewardOverlay         (confetti + XP count-up)
```

### 3.3 Shared client libs (`src/lib/`)

```
src/lib/
├── types.ts                  # Every domain interface (single source of truth)
├── utils.ts                  # Pure helpers (formatDate, cn, formatNumber, …)
├── mock.ts                   # Fixture data for offline mode (USE_MOCKS=true)
├── store.ts                  # Zustand: sidebar, mobile nav, ws status
├── auth.tsx                  # <AuthProvider> + useAuth() hook
├── providers.tsx             # QueryClient + Auth + <Toaster>
├── api.ts                    # Axios client + all API call functions
├── ws.ts                     # EventSource client (SSE leaderboards)
└── hooks/                    # React Query wrappers
    ├── useCompetition.ts
    ├── useClass.ts
    ├── useProfile.ts
    ├── useLeaderboard.ts
    ├── useDashboard.ts
    ├── useCountdown.ts       # countdown + attempt timer
    └── useCountUp.ts         # XP count-up animation
```

---

## 4. Backend layer

### 4.1 API routes (`src/app/api/`)

Every endpoint is a Next.js route handler. Grouped by feature:

```
src/app/api/
│
├── auth/
│   ├── login/route.ts                    POST  bcrypt + JWT (rate-limited)
│   ├── register/route.ts                 POST  Create user + verify email
│   ├── me/route.ts                       GET   Current user from JWT
│   ├── verify-email/route.ts             GET   Token → flip emailVerified
│   ├── forgot-password/route.ts          POST  Generate OTP + email it
│   ├── reset-password/route.ts           POST  OTP → new password hash
│   ├── join/[code]/route.ts              GET   Preview comp or class by code
│   └── google/
│       ├── start/route.ts                GET   Redirect to Google consent
│       └── callback/route.ts             GET   Code exchange + user upsert
│
├── profile/
│   ├── route.ts                          GET/PATCH  Me + update
│   ├── badges/route.ts                   GET   All badges + earned status
│   ├── certificates/route.ts             GET   User's certificates
│   ├── skills/route.ts                   GET   Derived from attempt history
│   └── activity/route.ts                 GET   Activity event feed
├── users/[id]/route.ts                   GET   Public profile
│
├── competitions/
│   ├── route.ts                          GET   List
│   └── [id]/
│       ├── route.ts                      GET   Detail + viewer's attempt
│       ├── questions/route.ts            GET   Answers stripped server-side
│       ├── submit/route.ts               POST  SCORING ENGINE + XP + badges + cert + email
│       ├── result/route.ts               GET   Attempt + reveal correct answers
│       └── leaderboard/
│           ├── route.ts                  GET   Top 50 by score
│           └── stream/route.ts           GET   SSE live leaderboard
│
├── classes/
│   ├── route.ts                          GET/POST  List + create (staff only)
│   └── [id]/
│       ├── route.ts                      GET
│       ├── students/route.ts             GET
│       └── leaderboard/route.ts          GET
│
├── leaderboard/route.ts                  GET   Global or institute scope
├── dashboard/stats/route.ts              GET   Role-specific tiles
│
├── billing/
│   ├── subscription/route.ts             GET   Plan + usage
│   ├── packages/route.ts                 GET   Pricing plans
│   ├── invoices/route.ts                 GET
│   ├── checkout/route.ts                 POST  Stripe Checkout session
│   ├── portal/route.ts                   POST  Stripe Customer Portal
│   └── webhook/route.ts                  POST  Stripe webhook (raw body, sig verified)
│
├── certificates/[id]/route.ts            GET   Renders PDF on demand
├── uploads/presign/route.ts              POST  R2 presigned PUT URL
│
└── ai/
    ├── generate/route.ts                 POST  Groq (or OpenAI) → JSON questions
    └── syllabus/route.ts                 POST  Multipart upload → R2
```

### 4.2 Server-only libs (`src/lib/server/`)

These never get bundled to the client. They're imported only by API routes.

```
src/lib/server/
├── jwt.ts                    # HS256 sign/verify, 7-day expiry
├── password.ts               # bcryptjs hash + verify (10 rounds)
├── session.ts                # getCurrentUser / requireUser / requireRole
├── http.ts                   # ok / badRequest / unauthorized / handle() wrapper
├── rate-limit.ts             # Upstash limiter (in-memory fallback)
├── email.ts                  # Resend client + 4 templated emails
├── stripe.ts                 # Stripe SDK singleton + price-id resolver
├── storage.ts                # R2 client + presigned PUT helpers
├── pdf.tsx                   # @react-pdf certificate doc + QR code
├── gamification.ts           # XP/level/tier math, join-code generator
└── serializers.ts            # Prisma rows → frontend type shapes
```

### 4.3 Middleware

```
src/middleware.ts             # Reads competeiq_token cookie,
                              # redirects unauthenticated users on /dashboard/**,
                              # redirects authenticated users away from /login etc.
```

---

## 5. Database layer

```
prisma/
├── schema.prisma             # 17 models, 11 enums, indexes, relations
└── seed.ts                   # Idempotent seed: institute, users, classes,
                              # competitions, questions, badges, packages,
                              # certificates, invoices
```

**Models (overview):**

| Group | Tables |
|---|---|
| Identity | `Institute`, `User` |
| Learning | `ClassRoom`, `ClassEnrollment`, `Competition`, `Question`, `QuestionOption` |
| Activity | `Attempt`, `AttemptAnswer`, `ActivityEvent` |
| Gamification | `Badge`, `UserBadge`, `Certificate` |
| Billing | `Package`, `Subscription`, `Invoice` |
| Messaging | `Notification` |

**Connection strategy (Neon):**

- `DATABASE_URL` → **pooled** connection (PgBouncer) — used by the running app
- `DIRECT_URL` → **direct** connection — used only by `prisma db push` / `migrate`

This combo survives Neon's free-tier auto-suspend, which would otherwise produce `E57P01` errors.

---

## 6. Production integrations (cross-cutting)

Each integration has its own server module + the routes that use it. **Every one activates automatically when its env vars are set, and falls back gracefully otherwise.**

| Integration | Module | Routes / consumers | Env vars |
|---|---|---|---|
| **Auth (JWT)** | `lib/server/jwt.ts`, `password.ts`, `session.ts` | All `/api/auth/*`, all guarded routes | `JWT_SECRET` |
| **Rate limiting** | `lib/server/rate-limit.ts` | `/api/auth/login`, `/register`, `/forgot-password`, `/ai/generate` | `UPSTASH_REDIS_REST_URL`, `_TOKEN` (optional) |
| **Email** | `lib/server/email.ts` | `/api/auth/register`, `/forgot-password`, `/competitions/[id]/submit` | `RESEND_API_KEY`, `EMAIL_FROM` |
| **Stripe** | `lib/server/stripe.ts` | `/api/billing/checkout`, `/portal`, `/webhook` | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_*` |
| **Google OAuth** | (none — inline) | `/api/auth/google/start`, `/callback` | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` |
| **File storage** | `lib/server/storage.ts` | `/api/uploads/presign`, `/api/ai/syllabus` | `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_PUBLIC_URL` |
| **AI generation** | (inline) | `/api/ai/generate` | `GROQ_API_KEY` (preferred) or `OPENAI_API_KEY` |
| **Certificate PDFs** | `lib/server/pdf.tsx` | `/api/certificates/[id]`, `/verify/[id]` | none (always works) |
| **Real-time** | (inline) + `lib/ws.ts` (client) | `/api/competitions/[id]/leaderboard/stream` | none (uses Postgres + SSE) |

---

## 7. Request flow examples

### A student submits a competition

```
Browser
  │
  │ POST /api/competitions/{id}/submit  { answers: [...] }
  ▼
src/app/api/competitions/[id]/submit/route.ts
  │
  ├─▶ requireUser(req)                       (session.ts → verifies JWT)
  ├─▶ Validate body with zod
  ├─▶ Score answers against Question rows    (Prisma)
  ├─▶ Compute XP / level / tier              (gamification.ts)
  ├─▶ Determine new badge unlocks
  ├─▶ Begin Prisma transaction:
  │     • create Attempt + AttemptAnswers
  │     • update User XP / level / tier
  │     • award UserBadges
  │     • upsert Certificate (if passed)
  │     • create ActivityEvent
  ├─▶ Fire-and-forget: sendCertificateReadyEmail()   (email.ts → Resend)
  └─▶ Return Attempt with newBadges
       │
       ▼
  Browser → router.push(`/competitions/${id}/results?celebrate=1`)
       │
       ▼
  ResultsView mounts:
       • Fetches /api/competitions/{id}/result
       • Opens EventSource on /leaderboard/stream    (ws.ts)
       • Shows RewardOverlay with XP count-up + badges
```

### An admin upgrades to Pro

```
Browser
  │
  │ POST /api/billing/checkout  { plan: 'pro', billing: 'monthly' }
  ▼
src/app/api/billing/checkout/route.ts
  ├─▶ requireRole(req, 'institute_admin')
  ├─▶ Resolve Stripe price ID                (stripe.ts → STRIPE_PRICE_*)
  ├─▶ Upsert Stripe customer if needed
  ├─▶ Create Stripe Checkout session
  └─▶ Return { url: session.url }
       │
       ▼
  Browser → window.location.assign(url)
       │
       ▼  Stripe-hosted Checkout page
       │
       │ Customer pays
       ▼
  Stripe → POST /api/billing/webhook
  src/app/api/billing/webhook/route.ts
       ├─▶ Verify signature                  (raw body)
       ├─▶ Switch on event.type:
       │      checkout.session.completed     → syncSubscription()
       │      customer.subscription.*        → syncSubscription()
       │      invoice.payment_*              → create Invoice row
       └─▶ Update DB
       │
       ▼  Stripe redirects browser back
  /billing?upgraded=1
       │
       ▼  BillingView refetches → shows "Pro · Active"
```

---

## 8. Conventions

- **`@/*` import alias** → `./src/*` (configured in `tsconfig.json`)
- **Files starting with `'use client'`** are CSR components. Everything else is RSC by default.
- **Component files** export named exports (e.g. `export function ClassCard`), with **barrel `index.ts`** in each folder.
- **Domain types** live in `src/lib/types.ts` only — server uses Prisma types and converts at the edge via `serializers.ts`.
- **No magic strings for env vars** — all env vars are read in their owning server module, with fallback behavior documented inline.
- **Every API route uses `handle()`** so thrown `HttpError` / `ZodError` become clean JSON responses.

---

## 9. Where to add things

| Want to add… | Touch these files |
|---|---|
| A new page | `src/app/(group)/<route>/page.tsx` + a feature folder under `src/components/<feature>/` |
| A new API endpoint | `src/app/api/<group>/<verb>/route.ts` + maybe a method in `src/lib/api.ts` |
| A new DB table | `prisma/schema.prisma` → `npm run db:push` → add a serializer + an endpoint |
| A new design-system primitive | `src/components/ui/<Name>.tsx` + export from `src/components/ui/index.ts` |
| A new email | `src/lib/server/email.ts` → add a `send<Name>Email()` helper using `wrap()` |
| A new badge/award rule | `src/app/api/competitions/[id]/submit/route.ts` + seed the badge in `prisma/seed.ts` |
| A new role-gated section | `src/components/layout/nav-config.ts` + protect via `requireRole` server-side |

---

## 10. Source-of-truth files (read these first when onboarding)

1. **`prisma/schema.prisma`** — the data model. If you understand this, you understand the product.
2. **`src/lib/types.ts`** — the API contract between frontend and backend.
3. **`src/lib/api.ts`** — every endpoint the frontend can call, mapped to its HTTP route.
4. **`src/middleware.ts`** + **`src/lib/server/session.ts`** — auth & route protection.
5. **`.env.example`** — every external service the project knows about.
