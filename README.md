# DOJO — AI Security Evolution Arena

**Break your AI before attackers do.**

DOJO is a planned AI security testing platform that aims to evolve adversarial tests against authorized AI applications, identify policy violations, propose defensive patches, and measure results through repeatable re-testing.

> **Project status:** The current repository contains the React frontend prototype. The Django API, Supabase persistence, Nemotron integrations, attack-evolution engine, patch application, and benchmark pipeline are planned next steps and are not yet implemented in this repository.

## Current frontend

The interface includes screens for:

- Landing page and dashboard
- Projects and project overview
- Arena and attack evolution
- Vulnerabilities and patches
- Benchmarks, reports, and settings

Some screens currently use illustrative or mock data. Do not interpret displayed demo metrics as results from real security tests.

## Tech stack

### Frontend

- React 19
- TypeScript 5.7
- Vite 8
- Tailwind CSS v4 with `@tailwindcss/vite`
- React Router v7
- Recharts
- Lucide React
- Framer Motion
- `clsx` and `tailwind-merge`

### Planned backend

- Django and Django REST Framework
- Supabase PostgreSQL
- Nemotron Nano, Ultra, and Super
- Nebius Serverless Jobs for parallel execution

## Repository structure

```text
dojo/
├── .github/
│   └── workflows/
│       └── frontend-ci.yml
├── backend/
│   └── README.md
├── docs/
│   ├── ARCHITECTURE.md
│   ├── ROADMAP.md
│   └── SRS.md
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── lib/
│   │   └── pages/
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── .gitignore
└── README.md
```

## Run the frontend locally

### Prerequisites

- Node.js 22 or a compatible current Node.js release
- npm

### Install and start

```bash
cd frontend
npm ci
npm run dev
```

Vite prints the local development URL when it starts. The default URL is `http://localhost:5173`.

### Validate the project

```bash
npm run typecheck
npm run build
npm run preview
```

### Environment configuration

Copy `frontend/.env.example` to `frontend/.env.local` when beginning the Django API integration. `VITE_API_BASE_URL` is a public frontend configuration value, not a place for secrets. Never place database passwords, Supabase service-role keys, or model API keys in frontend variables.

## Planned architecture

```text
React + TypeScript
        │ REST API
        ▼
Django + Django REST Framework
        │
        ├── Arena orchestration
        ├── Attack / evaluation workflow
        ├── Evolution and patch validation
        └── Model and job integrations
        │
        ▼
Supabase PostgreSQL

Nemotron models → attack generation, judging, strategy
Nebius Serverless Jobs → future parallel attack execution
```

Django is intended to own application logic and the schema for its managed tables. Supabase provides managed PostgreSQL. Keep credentials on the backend and apply appropriate authentication and row-level/data-access controls before storing user data.

## Development principles

1. Preserve the existing frontend design while wiring up real data.
2. Implement one vertical slice at a time: project creation, target configuration, one controlled test, evaluation, then evolution and patch validation.
3. Test against applications you own or are authorized to assess.
4. Treat model-generated evaluations as fallible; validate the judge against human-reviewed examples.
5. Report measured results only. Clearly identify sample/demo metrics and test conditions.

## Roadmap

See [docs/ROADMAP.md](docs/ROADMAP.md) for the implementation sequence, [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the planned components, and [docs/SRS.md](docs/SRS.md) for the requirements baseline.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the current contribution workflow.
