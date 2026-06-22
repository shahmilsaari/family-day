# Family Day

Next.js app for managing Family Day teams, games, member names, and scoring.

## What it includes

- Family Day event title, year, and tentative date
- Teams with member names
- Games for the leader dashboard
- Score entry per team per game
- Leaderboard totals
- Local SQLite database

## Setup

1. Install dependencies.

```bash
npm install
```

2. Start the app.

```bash
npm run dev
```

That command will:

- generate the Prisma client
- create the local SQLite database file if it does not exist
- create the tables needed by the app
- start Next.js

## Seed data

If you want sample data:

```bash
npm run db:seed
```

The seed script creates a demo user with the following credentials:

- **Email:** `demo@example.com`
- **Password:** `demo1234`

## Access control

- `/` (landing page) and `/display` (live projector view) are **public**.
- `/dashboard`, `/events`, and `/api/tentative-pdf` require authentication.
- Unauthenticated visitors are redirected to `/login`.

## Database

- The database lives in `dev.db`
- No Docker or external Postgres server is required
- Prisma is configured through [prisma.config.ts](/Users/shahmilsaari/Desktop/family-day/prisma.config.ts)

