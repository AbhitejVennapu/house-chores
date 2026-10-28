# Backend learning: progress

Branch: `custom-backend`. Read this file at the start of every session. Update it at the end, before the commit.

## Goal

Build our own backend and Postgres database as an alternative to Supabase. The app keeps working on Supabase. The goal is to learn backend and database fundamentals, not to ship fast.

## How we work

1. Concept first. Claude explains the idea and why it exists.
2. The user writes the core part. Claude gives a small task and hints. Claude writes the repeated parts.
3. Claude reviews the user's code and explains problems.
4. Small steps. Each step runs and is one commit.
5. Break things on purpose to learn what failures look like.
6. Notes per topic go in `docs/learning/`.
7. The user can say "just do it" for topics they already know.
8. The user runs the git commands. Claude explains each one. Claude does not push.

## Decisions

| Decision | Choice | Reason | Date |
|---|---|---|---|
| Server language | TypeScript (Node) | Already known. Types can be shared with the client. | 2026-10-28 |
| Database | Postgres | Same engine as Supabase. `supabase/schema.sql` is a starting point. | 2026-10-28 |
| Data access | Plain SQL first, ORM or query builder later | See what an ORM hides. | 2026-10-28 |
| Hosting | Local only (Docker Compose) | Learn the core first. Deploy later. | 2026-10-28 |
| Frontend integration | `DataSource` interface over `src/data/remote.ts`, chosen by env var | Keeps Supabase working. | 2026-10-28 |
| Web framework | Undecided | Hono or Fastify. Decide at step 1. | |

## Roadmap

Status: `todo`, `doing`, `done`.

| # | Step | Status |
|---|---|---|
| 1 | HTTP fundamentals and a tiny server (`GET /health`) | todo |
| 2 | Postgres in Docker, schema design, basic SQL | todo |
| 3 | First endpoints: chores and completions | todo |
| 4 | Migrations | todo |
| 5 | Tests and CI (run on pull requests) | todo |
| 6 | Validation, errors, logging | todo |
| 7 | Auth and households | todo |
| 8 | Transactions and concurrency | todo |
| 9 | Realtime (SSE) and frontend switch via `DataSource` | todo |
| 10 | Config, secrets, environments | todo |
| 11 | Deploy and continuous deployment | todo |
| 12 | Load balancer experiment (optional) | todo |

## Current step

Step 1. Not started.

## Session log

Newest first.

- 2026-10-28: Planned the learning. Chose TypeScript and local-only. The user created the `custom-backend` branch.

## Open questions

- Web framework: Hono or Fastify?

## Concepts learned

None yet.
