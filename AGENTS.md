# DOJO repository guide

## Project status

The current implementation is a React + TypeScript frontend prototype. The Django backend and Supabase integration are planned, not yet implemented.

## Frontend commands

Run these commands from `frontend/`:

```bash
npm ci
npm run dev
npm run typecheck
npm run build
```

## Working principles

- Preserve the existing UI, routing, typography, and responsive behavior unless the task explicitly requests design changes.
- Use TypeScript and the existing component/style conventions.
- Do not add real credentials to frontend files or commit `.env` files.
- Do not portray illustrative UI data as measured security results.
- Keep backend/model integration on the server side.
- Only test targets that are owned or explicitly authorized.
- Before claiming work is verified, run the relevant checks and report their actual outcomes.
