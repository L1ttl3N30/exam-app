# IELTS Test Platform

Full-stack Next.js 14 + TypeScript app for MCQ tests, AI-graded writing tasks, Stripe payments (one-time + subscription), and admin management.

## Tech Stack

- Next.js 14 (App Router, TypeScript)
- Prisma ORM + PostgreSQL
- NextAuth (email/password via Credentials)
- Tailwind CSS
- Stripe (Checkout + webhook)
- OpenAI API for writing grading
- SendGrid for email (stubbed to `console.log` if key missing)
- Docker + docker-compose

## Setup

### 1. Clone and install

```bash
npm install

### 2. Environment variables

Copy .env.example:
cp .env.example .env
and set:
DATABASE_URL
NEXTAUTH_SECRET
NEXTAUTH_URL
NEXT_PUBLIC_APP_URL
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_WEEKLY_PRICE_ID
STRIPE_MONTHLY_PRICE_ID
OPENAI_API_KEY
OPENAI_MODEL (optional, defaults to gpt-4o-mini)
SENDGRID_API_KEY, SENDGRID_FROM_EMAIL (optional; falls back to console.log if not set)

### 3. Database setup
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed

The seed creates:
Admin user: admin@example.com / AdminPass123
Sample MCQ and Writing tests.

### 4. Development
npm run dev
App: http://localhost:3000

### 5. Stripe webhook (local)

- Install ngrok.

- Start dev server:
npm run dev

-In another terminal:
ngrok http 3000

- Copy the HTTPS URL from ngrok (for example https://abcd1234.ngrok.io).

- In Stripe Dashboard, add a webhook endpoint:
URL: https://abcd1234.ngrok.io/api/stripe/webhook
Events: checkout.session.completed

- Set STRIPE_WEBHOOK_SECRET in .env to the signing secret from Stripe.

### 6. Payments
- One-time per-test:
Create Stripe Prices and add stripePriceId to each Test via Admin UI.
Call /api/stripe/checkout with { testId, mode: "one_time" } from the client (e.g., via fetch) to get a Checkout URL.

- Subscriptions:
Create weekly and monthly Prices in Stripe.
Set STRIPE_WEEKLY_PRICE_ID, STRIPE_MONTHLY_PRICE_ID in .env.
Call /api/stripe/checkout with { mode: "weekly" } or { mode: "monthly" }.

-Webhook will create Purchase records and mark them as ACTIVE, granting access.

### 7. AI grading

- /api/writing/grade:
Uses OPENAI_API_KEY.
Reads rubric from Test.writingRubricJson:
  keywords (string array)
  keywordWeight (0.0–1.0, default 0.4)
  structureWeight (default 0.3)
  styleWeight (default 0.3)

Returns score and feedback, stored in Attempt.

### 8. Vercel Deployment
- Push repo to GitHub.
- Import project in Vercel.
- Set environment variables in Vercel dashboard.
- Use managed Postgres (e.g., Vercel Postgres or any cloud Postgres).
- Run migrations:
    npx prisma migrate deploy
- Run seed manually once (e.g., via a one-off node script or using npx ts-node prisma/seed.ts in a Vercel build/CLI context).

### 9. Docker Deployment
  docker-compose up --build
This runs:
Postgres at db:5432
Next.js app at localhost:3000
*Ensure .env matches docker-compose.yml env values or override them.

### 10. Authentication
- Credentials provider with email/password.
- /auth/signup to create a user.
- /auth/login to sign in.
- Protected routes via middleware.ts for:
    /dashboard
    /tests/*
    /writing/*
    /admin/*
*Admin-only access for /admin and related API routes is enforced via session.user.role === "ADMIN" checks.
