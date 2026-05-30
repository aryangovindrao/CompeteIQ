# CompeteIQ

A gamified competition platform for schools and institutes. Teachers create competitions (auto-generated with AI), students compete in real time, top scorers earn shareable PDF certificates with QR-code verification.

**Tech stack:** Next.js 14 (App Router) · TypeScript · Tailwind · Prisma · Postgres · JWT auth · Stripe · Resend · Groq / OpenAI · Cloudflare R2 · Server-Sent Events

---

## Quick start

```bash
# 1. Install
npm install

# 2. Configure (copy template + paste your Neon URL + a random JWT secret)
cp .env.example .env.local
# edit .env.local — fill in DATABASE_URL, DIRECT_URL, JWT_SECRET

# 3. Push schema + seed demo data
npm run db:push
npm run db:seed

# 4. Run
npm run dev
```

Open <http://localhost:3000>. Demo accounts (password `demo1234` for all):

| Email | Role |
|---|---|
| `admin@northwood.edu` | Institute admin |
| `meera@northwood.edu` | Teacher |
| `aryan@northwood.edu` | Student |

---

## Scripts

```bash
npm run dev          # dev server (hot reload)
npm run build        # production build (runs prisma generate first)
npm run start        # serve the built app
npm run typecheck    # tsc --noEmit
npm run lint         # next lint

npm run db:push      # push schema to DB without migrations
npm run db:seed      # populate demo data
npm run db:reset     # nuke + reseed
npm run db:generate  # regenerate Prisma client
npm run db:studio    # open Prisma Studio
```

---

## What's in the box

- ✅ **Real authentication** — bcrypt + JWT + email verification + Google OAuth + rate limiting
- ✅ **Real payments** — Stripe Checkout + Customer Portal + webhook → DB sync
- ✅ **Real email** — Resend transactional emails (verify, reset, certificate-ready)
- ✅ **AI question generation** — Groq (free tier) or OpenAI, with templated fallback
- ✅ **Certificate PDFs** — server-rendered with QR code, public verification page
- ✅ **File storage** — Cloudflare R2 with presigned uploads
- ✅ **Real-time leaderboards** — Server-Sent Events from Postgres
- ✅ **Gamification** — XP, levels, tiers, badges with reward overlay

Every external service activates when its env vars are set. The app builds and runs with just `DATABASE_URL` + `DIRECT_URL` + `JWT_SECRET`.

See [ARCHITECTURE.md](./ARCHITECTURE.md) for a full map of the codebase.

---

## Project layout (one-screen overview)

```
prisma/                   Database schema + seed
src/
├── app/
│   ├── (marketing)/      Public pages
│   ├── (auth)/           Login / register / reset
│   ├── (dashboard)/      Authenticated app
│   ├── auth/callback/    OAuth hydration
│   ├── verify/[id]/      Public certificate verification
│   └── api/              All backend endpoints
├── components/           React components by feature
├── lib/                  Shared client libs (api, hooks, store, types)
├── lib/server/           Server-only modules (jwt, email, stripe, pdf, …)
└── middleware.ts         Route guard
```

---

## Deployment (free tier)

The app is designed to run on a $0/month stack:

| Service | What for | Free tier |
|---|---|---|
| **Vercel** | Hosting | Hobby plan |
| **Neon** | Postgres | 0.5 GB |
| **Resend** | Email | 3,000/mo |
| **Groq** | AI | ~14k req/day |
| **Stripe** | Payments | 2.9% + 30¢ per txn |
| **Cloudflare R2** | Files | 10 GB egress/mo |
| **Upstash Redis** | Rate limit | 10k cmds/day |

For the full step-by-step including Stripe webhook configuration and custom domains, see the deployment section in [ARCHITECTURE.md](./ARCHITECTURE.md).

---

## Environment variables

Every var is documented in [`.env.example`](./.env.example). Required minimum:

```bash
DATABASE_URL=                 # Neon pooled URL
DIRECT_URL=                   # Neon direct URL
JWT_SECRET=                   # 64+ random chars
NEXT_PUBLIC_APP_URL=          # http://localhost:3000 (or your domain)
```

Optional integrations light up as you add their keys:

- `RESEND_API_KEY` → real email
- `STRIPE_SECRET_KEY` + price IDs + webhook secret → payments
- `GROQ_API_KEY` (or `OPENAI_API_KEY`) → real AI
- `GOOGLE_CLIENT_ID/SECRET` → Google sign-in
- `SUPABASE*` → file storage
- `UPSTASH_REDIS_REST_URL/TOKEN` → distributed rate limiting

--
