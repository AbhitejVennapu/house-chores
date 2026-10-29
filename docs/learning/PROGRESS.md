# Backend learning: progress

Branch: `custom-backend`. Read this file at the start of every session. Update it only when the user asks, usually before they stop.

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

| Decision             | Choice                                                                                                                    | Reason                                                                                                         | Date       |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ---------- |
| Server language      | TypeScript (Node)                                                                                                         | Already known. Types can be shared with the client.                                                            | 2026-10-28 |
| Database             | Postgres                                                                                                                  | Same engine as Supabase. `supabase/schema.sql` is a starting point.                                            | 2026-10-28 |
| Data access          | Plain SQL first, ORM or query builder later                                                                               | See what an ORM hides.                                                                                         | 2026-10-28 |
| Hosting              | Local only (Docker Compose)                                                                                               | Learn the core first. Deploy later.                                                                            | 2026-10-28 |
| Frontend integration | `DataSource` interface over `src/data/remote.ts`, chosen by env var                                                       | Keeps Supabase working.                                                                                        | 2026-10-28 |
| Web framework        | Express 5                                                                                                                 | Biggest ecosystem and most tutorials. Thin layer over `node:http`. Hono and Fastify were the other candidates. | 2026-10-29 |
| Step order           | Migrations in step 2. Tests start in step 3. Auth and households split into steps 7 and 8. Transactions taught in step 4. | Plan review. Migrations and tests were too late. Auth and households were one step.                            | 2026-10-28 |

## Roadmap

Status: `todo`, `doing`, `done`.

| #   | Step                                                     | Status | Done when                                                                                                           |
| --- | -------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------- |
| 1   | HTTP fundamentals and a tiny server                      | done   | `GET /health` returns `200` and `{"ok":true}`. Other paths return `404`.                                            |
| 2   | Postgres in Docker, first migration, basic SQL, env vars | doing  | Postgres runs in Docker. The first migration creates the chores table. The server reads the DB URL from an env var. |
| 3   | Chores endpoints, with tests (parameterized SQL)         | todo   | Create and list chores work. Tests cover both.                                                                      |
| 4   | Completions endpoint: transactions and idempotency       | todo   | Two simultaneous Done requests write one completion row.                                                            |
| 5   | Validation, errors, logging                              | todo   | Bad input returns `400` with one error shape. Each request is logged.                                               |
| 6   | Indexes and query plans (`EXPLAIN`)                      | todo   | A query plan shows an index scan for the chore list.                                                                |
| 7   | Auth: users, password hashing, sessions                  | todo   | A user signs up, logs in, and calls a protected route.                                                              |
| 8   | Households: authorization (replaces RLS)                 | todo   | A user sees only their household's chores.                                                                          |
| 9   | CI on pull requests                                      | todo   | A pull request runs the tests in CI and shows pass or fail.                                                         |
| 10  | Realtime (SSE)                                           | todo   | A second client gets a chore change without reloading.                                                              |
| 11  | Deploy: HTTPS, reverse proxy, secrets                    | todo   | The API runs on a public HTTPS URL.                                                                                 |
| 12  | Frontend switch via `DataSource`                         | todo   | The app works on Supabase and on this backend. An env var picks one.                                                |
| 13  | Load balancer experiment (optional)                      | todo   | Two server instances run behind a load balancer. Requests reach both.                                               |

## Current step

Step 2. Started. Concept stage: Docker, Postgres, migrations, env vars. Docker check pending. The server now runs on Express, with `/health` and a JSON 404 fallback. Next: move the hardcoded port `3000` into an env var, then Docker and Postgres.

## Session log

Newest first.

- 2026-10-29: Chose Express 5 as the web framework. Installed `express` and `@types/express` in `server/`. The user ported `GET /health` to `app.get` and wrote the JSON 404 fallback with `app.use`. Verified with `curl -i`. Also set up Prettier (root `.prettierrc`, `format` and `format:check` scripts, VS Code format on save), and learned the difference between oxlint (linter) and Prettier (formatter). Step 2 still in the concept stage.
- 2026-10-28: Completed step 1. `server/` created with TypeScript and `tsx`. `server/src/index.ts` serves `GET /health` (`200`, `{"ok":true}`) and `404` for other paths. Verified with curl. Learned about `npm run dev`, `tsconfig.json`, and the editor format-on-save setup. Started step 2 at the concept stage.
- 2026-10-28: Reviewed the plan with the user. Revised the roadmap order and added "Done when" criteria. Started step 1 at the concept stage (HTTP request and response). Goal question still open.
- 2026-10-28: Planned the learning. Chose TypeScript and local-only. The user created the `custom-backend` branch.

## Open questions

- Goal: learn concepts well enough to explain them, or build something production-ready? This sets the depth of steps 9, 11, and 13.

## Concepts learned

Step 1:

- HTTP request has a method, a path, and headers. HTTP response has a status code, headers, and a body.
- Status code groups: `2xx` success, `4xx` client error, `5xx` server error.
- `http.createServer` runs its callback once per request. `req.url` holds the path and query string.
- `curl -i` shows the status code and headers.
- `npm run dev` runs a script from `package.json`. `tsx watch` restarts on save.
- `tsconfig.json`: `types` loads Node type definitions. `include` picks the files to check.
- `req.url.split("?")[0]` gives the path without the query string. Use `===` for an exact match. `includes` matches too much.

Express setup (between steps 1 and 2):

- `npm install express` goes in `dependencies` (needed at runtime). `npm install -D @types/express` goes in `devDependencies` (types only). Run npm commands inside `server/`, which has its own `package.json`.
- `app.get(path, handler)` answers one method and one path. `app.use(handler)` with no path runs for every request that reaches it. `app.listen(port, callback)` starts the server.
- Express runs handlers in the order they are registered. The first one that sends a response ends the chain, so the 404 `app.use` goes last. Moving it above `/health` breaks `/health`.
- `next()` passes a request to the next handler. A handler that neither responds nor calls `next()` makes the request hang.
- `res.status(200).json({...})` sets the status, sets `Content-Type`, and sends JSON. Express also adds `ETag`, `Content-Length`, and `X-Powered-By` headers.
- A linter (oxlint) finds likely bugs. A formatter (Prettier) fixes layout. Root `npm run lint` already scans `server/`.
- npm scripts run tools from `node_modules/.bin`, so `prettier` works in a script without `npx`.

Step 2 (planned):

- Docker runs a program in a container. Postgres runs in a container, so it need not be installed on the Mac.
- A migration is a numbered SQL file. The database records which files ran.
- Env vars keep settings such as `DATABASE_URL` out of the code.
