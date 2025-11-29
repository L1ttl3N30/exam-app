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
