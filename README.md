# House Chores

A shared chore tracker for two people. Each chore has a frequency (every N days or weeks). When someone marks it done, the app works out when it's due next. It's a PWA, so it installs to the phone's home screen.

Stack: React + Vite + TypeScript, Supabase (auth, Postgres, realtime), hosted on GitHub Pages.

## Features

- Email and password sign-in, with a magic link for first sign-in and recovery. Create a household, or join one with its ID.
- Chores with a frequency in days or weeks, assigned to Me, Partner, or Anyone.
- Today screen: overdue, due today, and upcoming, with a Done button and an Undo toast.
- History grouped by day, with Undo.
- Live sync between devices through Supabase realtime.
- Display names, shown in place of "Me" and "Partner".
- JSON export from Settings.

## Local setup

```bash
npm install
cp .env.example .env   # then fill in the two values below
npm run dev            # http://localhost:5173
```

In `.env`, set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from Supabase → Project Settings → API. The anon key is public by design; Row Level Security protects the data.

## Supabase setup (one time)

1. **Fresh project:** run `supabase/schema.sql` once in the SQL editor. It includes display names.
2. **Existing project from before display names:** run only `supabase/migrations/002_profiles.sql`.
3. **Authentication → URL Configuration:** set the Site URL to `https://abhitejvennapu.github.io/house-chores/`. Add it and `http://localhost:5173/` to the redirect URLs.
4. **Password length:** under Authentication → Providers → Email, set the minimum password length to 8 or more.
5. **Email limits:** Supabase's built-in sender allows about 2 sign-in emails an hour. For more, set up custom SMTP under Authentication → Emails.

## Deployment

Pushing to `main` runs `.github/workflows/deploy.yml`, which tests, builds, and publishes to GitHub Pages.

- One-time: in the repo's Settings → Pages, set **Source** to **GitHub Actions**.
- One-time: add repository secrets `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` under Settings → Secrets and variables → Actions. The build fails without them.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Local dev server |
| `npm test` | Unit tests for date and due-date logic |
| `npm run build` | Type-check and production build to `dist/` |
| `npm run lint` | Lint with oxlint |

## Project layout

- `src/App.tsx`: the signed-in shell, tabs, and Done toast
- `src/auth/AuthGate.tsx`: decides between sign-in, household setup, and the app
- `src/components/`: screens and forms
- `src/hooks/useChoreStore.ts`: loads household data, subscribes to changes, and exposes actions
- `src/data/remote.ts`: all Supabase queries
- `src/lib/`: date and due-date logic, labels, and the Supabase client
- `supabase/schema.sql`: tables, Row Level Security policies, and functions

## Status

Working: sign-in, household create and join, chores, completions, live sync, display names, the Undo toast, and home-screen icons.

Known limits:
- No offline mode. The app needs a connection.
- JSON import was removed. Data lives in Supabase.
- The built-in email sender allows about 2 sign-in emails an hour.
- Not yet checked on every device and in dark mode.
