# House Chores: agent guide

Read this before exploring the repo. For the full schema, security rules, and decisions, read `docs/architecture.md`. For setup and deployment steps, read `README.md`.

For backend-learning work on the `custom-backend` branch, read `docs/learning/PROGRESS.md` first. It holds the plan, the decisions, and the current step. After each completed step, and before a session ends, update that file: the roadmap status, the session log, and the concepts learned. Do not commit. The user commits.

## What it is

A shared chore tracker for two people in one household. Each chore has a frequency in days. Marking it done sets the next due date. It's a PWA hosted on GitHub Pages, backed by Supabase.

Stack: React 19, Vite 8, TypeScript, `@supabase/supabase-js`, `vite-plugin-pwa`, Vitest, oxlint.

## Map

- `src/main.tsx`: mounts `AuthGate`.
- `src/auth/AuthGate.tsx`: the flow gate. No session shows `SignIn`. A session with no household shows `HouseholdSetup`. Otherwise it renders `App`.
- `src/App.tsx`: the signed-in shell. Four tabs: Today, Chores, History, Settings. Also the Done toast with Undo.
- `src/components/`: one file per screen (`Dashboard` is the Today tab), plus `ChoreForm`, `SignIn`, `HouseholdSetup`, `icons.tsx`.
- `src/hooks/useChoreStore.ts`: the single data hook. Loads the household, subscribes to realtime changes, holds the toast, and exposes all actions. Components get the data through the `ChoreStore` prop.
- `src/data/remote.ts`: every Supabase query and write. Maps the app's `me`, `partner`, and `anyone` to user IDs and back.
- `src/lib/chores.ts`: due-date logic (`summarizeChore`). Pure, and covered by tests.
- `src/lib/dates.ts`: local-date helpers. Pure, and covered by tests.
- `src/lib/labels.ts`: display strings and `ASSIGNEE_LABELS`.
- `src/lib/supabase.ts`: the client. It throws at import if the env vars are missing.
- `src/types.ts`: `Chore`, `Completion`, `Assignee`, `HouseholdData`.
- `src/index.css`: the design system. Class names are `hc-*`.
- `supabase/schema.sql`: full schema, RLS, functions, grants, realtime. Run once for a fresh project.
- `supabase/migrations/002_profiles.sql`: display names. Already included in `schema.sql`. Run it only on projects created before names existed.
- `.github/workflows/deploy.yml`: test, build, and deploy to Pages on push to `main`.

## Rules for working here

- Run `npm test`, `npm run build`, and `npm run lint` before committing. Lint has two known `set-state-in-effect` warnings, in `AuthGate` and `useChoreStore`. Don't add new ones.
- Pushing to `main` deploys the live site. Commit freely, but only push when the user asks.
- Any new table needs four things in the same change: `grant` to `authenticated`, RLS enabled with policies, an entry in the realtime publication if it syncs live, and an update to `docs/architecture.md`.
- Any schema change needs a new migration file under `supabase/migrations/`, not an edit to an existing one. `schema.sql` must still work for a fresh project.
- Components use only classes that exist in `src/index.css`. If you add a class, add its CSS in the same change.
- Keep `src/lib/` free of Supabase imports so its tests run without env vars.
- Refer to files by name in docs, not by line number.
- Commit messages end with the `Co-Authored-By` trailer used in recent commits.

## Gotchas

- The app needs `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Locally they come from `.env`, which is git-ignored. In CI they come from repository secrets.
- The build sets `base` to `/house-chores/` only when `GITHUB_ACTIONS` is set. Local dev runs at `/`.
- The built-in Supabase email sender allows about 2 sign-in emails an hour.
- There is no offline mode. Every read and write needs a connection.
- Marking a chore done inserts a completion row. A chore's last-done date is never stored. It's derived from the latest completion.
- Partner-related UI (the "Partner" label and filter) only appears once a second member has joined.
