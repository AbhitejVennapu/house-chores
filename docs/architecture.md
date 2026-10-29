# Architecture

Reference for how House Chores works. `CLAUDE.md` is the short version. Keep this file current: any change to the schema, auth, or deploy setup updates it in the same commit.

## Components

```
Browser (PWA)                          Supabase
┌──────────────────────────────┐       ┌───────────────────────────┐
│ AuthGate                     │ auth  │ Auth (email + password)   │
│   ├─ SignIn                  │◄─────►│                           │
│   ├─ HouseholdSetup          │ rpc   │ Postgres                  │
│   └─ App                     │◄─────►│   tables + RLS + functions│
│       └─ useChoreStore      │ CRUD  │                           │
│            └─ data/remote   │◄─────►│ Realtime                  │
│                             │ WS    │   chores, completions     │
└──────────────────────────────┘       └───────────────────────────┘
        ▲ static files
        │
GitHub Pages ◄── GitHub Actions (test, build, deploy on push to main)
```

The app has no backend of its own. The browser talks to Supabase directly. Access control lives in Postgres row-level security (RLS), not in the client.

## Auth and household flow

1. `AuthGate` reads the session. There's no session, so it shows `SignIn`.
2. `SignIn` signs in with email and password (`signInWithPassword`). The fallback is a magic link (`signInWithOtp`) that redirects to the app's base URL, used for first sign-in and forgotten passwords.
   - After a session exists, `AuthGate` shows `SetPassword` until `user_metadata.has_password` is true. "Not now" is remembered per user in `localStorage`. Settings has the same `PasswordForm` for changing it later.
3. With a session, `AuthGate` looks up the user's row in `household_members`.
4. No row: `HouseholdSetup`.
   - Create: `create_household()` creates a household and adds the caller as its first member.
   - Join: `join_household(id)` adds the caller to an existing household. The UUID is the join secret, so it's shared only between the two people.
5. A row exists: `App` renders with the household ID and user ID.

## Data model

| Table | Key columns | Notes |
|---|---|---|
| `households` | `id`, `name` | Created only by `create_household()` |
| `household_members` | `household_id`, `user_id` | Primary key is the pair. Lets one user belong to one household in practice |
| `chores` | `id`, `household_id`, `name`, `frequency_days`, `assignee_user_id` | `assignee_user_id` null means "Anyone" |
| `completions` | `id`, `household_id`, `chore_id`, `done_on` (date), `done_by` | One row per time a chore was done |
| `profiles` | `user_id`, `display_name` | Readable by members of a shared household |

Derived values are never stored:
- A chore's last-done date is the latest `done_on` among its completions.
- Due date = last-done date + `frequency_days`. A never-done chore is due today.
- Status: overdue if the due date is before today, due today if equal, otherwise upcoming.

The app's `Assignee` (`me` | `partner` | `anyone`) is relative to the signed-in user. The database stores user IDs. `src/data/remote.ts` converts between the two.

## Row-level security

- `is_household_member(hid)` is a `security definer` function. Policies call it, so they don't recurse into `household_members`.
- `households`: members can read.
- `household_members`: members can read rows for their own households. A user can always read their own row.
- `chores` and `completions`: members can read and write rows for their household.
- `profiles`: a user can write their own row. Members of a shared household can read each other's rows.
- Functions are executable by `authenticated` only. `anon` and `public` are revoked.
- Tables are granted to `authenticated` explicitly. RLS then limits which rows each user can see.

## Realtime

`chores` and `completions` are in the `supabase_realtime` publication. `useChoreStore` subscribes with a filter on `household_id`. Any change triggers a full reload of the household, so the app always shows database state. Profile changes are picked up on the next reload.

## Client data flow

- Reads: `fetchHousehold` runs three queries in parallel (chores, completions, members), then one query for profile names. Profile failures are logged and the app falls back to "Me" and "Partner".
- Writes: each action in `useChoreStore` calls one function in `remote.ts`, then reloads. Done is the exception. It keeps the new completion ID so the toast can undo it.
- Errors: write and load errors go into `store.error` and show above the content.

## Deploy

1. Push to `main`.
2. The `build` job runs `npm ci`, `npm test`, and `npm run build`. The Supabase URL and anon key come from repository secrets.
3. The build output is uploaded as a Pages artifact.
4. The `deploy` job publishes it.

The Vite `base` is `/house-chores/` in CI and `/` locally. The PWA manifest uses the same base. Icons are in `public/`: `favicon.svg`, `icon-192.png`, `icon-512.png`, and `apple-touch-icon.png`.

## Decisions

- **Supabase over Firebase.** Postgres and SQL suit relational data. RLS keeps authorization in the database, and the client needs no server.
- **Password sign-in, magic link as fallback.** A magic link opens in the system browser, not the installed PWA, so the PWA stays signed out. A password set once works on every device. Supabase hashes it (bcrypt in `auth.users`). Magic links remain for first sign-in and recovery, so the email rate limit (about 2 an hour on the built-in sender) rarely bites.
- **Household UUID as the join secret.** Simple to share between two people. A stronger model (invite codes with expiry) would be needed if the app ever had more users.
- **Assignee stored as a user ID.** "Me" and "Partner" mean different people on each device, so the database stores who is meant.
- **Due dates derived, not stored.** Changing a frequency immediately changes every due date, and there's no stored state to fall out of sync.
- **Static PWA, not Next.js.** There's no server rendering to justify it. Vite builds plain files that GitHub Pages serves.
- **No offline mode.** It adds a sync queue and conflict handling. The two-person use case doesn't need it yet.
- **Local storage removed after checkpoint 2.** Keeping it as a cache would mean two sources of truth.
- **Design system from the Claude design canvas (v2).** Tokens live in `src/index.css`. Class names are the `hc-*` set.

## Known gaps

- No offline mode.
- No JSON import. Export only.
- Email rate limit on the built-in sender.
- Lint warnings for `setState` in effects in `AuthGate` and `useChoreStore`.
- Tests cover only `src/lib/dates.ts` and `src/lib/chores.ts`. Components, `remote.ts`, and the RLS policies aren't tested automatically.
- Not yet checked on every device and in dark mode.
