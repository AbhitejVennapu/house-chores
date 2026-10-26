# House Chores

A small PWA for tracking recurring household chores. Each chore has a frequency. Mark it done, and the app works out when it's due next.

## Development

```bash
npm install
npm run dev     # http://localhost:5173
npm test        # unit tests for date and chore logic
npm run build   # type-check and production build to dist/
```

## Deployment

Pushing to `main` runs `.github/workflows/deploy.yml`, which tests, builds, and publishes to GitHub Pages.
One-time setup: in the repo's Settings → Pages, set **Source** to **GitHub Actions**.

## Status

- **Checkpoint 1 (current):** all data lives in this browser's localStorage. Export backups from Settings.
- **Checkpoint 2 (planned):** Supabase for sync between devices. The schema is in `supabase/schema.sql` and is not applied yet.
