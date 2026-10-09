# Contributing to DOJO

Thanks for your interest in DOJO. The project is in an early frontend-prototype stage.

## Before making changes

1. Read the project status and roadmap in `README.md` and `docs/ROADMAP.md`.
2. Create a focused branch for your change.
3. Avoid committing generated output, dependencies, environment files, credentials, or real customer data.

## Frontend workflow

```bash
cd frontend
npm ci
npm run typecheck
npm run build
```

Keep TypeScript types explicit, reuse existing components where practical, and preserve the current responsive design. Do not add fake benchmark results or imply that planned backend features are implemented.

## Security

Only test systems you own or have explicit authorization to assess. Never submit secrets, private data, or third-party credentials in issues, test cases, or pull requests. Report accidentally committed secrets immediately and rotate them; deleting them from a later commit is not sufficient.

## Pull requests

Include a concise description, screenshots for visible UI changes, tests performed, and any known limitations.
