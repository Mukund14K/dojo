# DOJO Architecture (Planned)

## Current state

The repository currently contains a React frontend prototype. The backend, persistent database integration, model calls, attack execution, and patch validation are not implemented yet.

## Target architecture

```text
React + TypeScript (frontend)
           │ HTTPS / REST
           ▼
Django REST Framework (application API)
           │
           ├── Projects and target configuration
           ├── Arena orchestration
           ├── Attack execution
           ├── Evaluation and evolution
           ├── Vulnerability analysis
           ├── Patch proposal and validation
           └── Benchmark and report generation
           │
           ├──────────────► Nemotron model services
           ├──────────────► Nebius Serverless Jobs (parallel work, later phase)
           ▼
Supabase PostgreSQL
```

## Responsibility boundaries

- **React:** presentation, navigation, forms, visualization, and API calls. It must not contain private model or database credentials.
- **Django REST Framework:** authorization, validation, business rules, orchestration, persistence access, and integration with AI/job providers.
- **Supabase PostgreSQL:** managed relational storage for application data. Use appropriate access policies and server-side credentials.
- **Nemotron models:** planned roles for attack generation, policy judging, and strategy/patch assistance. Outputs must be validated and treated as fallible.
- **Nebius Serverless Jobs:** planned parallel execution for bounded jobs against authorized targets.

## Planned data entities

- `Project`: name, description, owner, timestamps.
- `Target`: project, endpoint configuration, request/response mapping, credential reference.
- `Policy`: project, natural-language policy, measurable checks.
- `Arena`: target, policy snapshot, status, configuration, timestamps.
- `Generation`: arena, generation number, summary metrics.
- `Attack`: generation, category, payload reference, parent attack, fitness.
- `AttackResult`: attack, response evidence, judge output, execution status.
- `Vulnerability`: category, severity, evidence, status.
- `Patch`: vulnerability, proposed change, approval/application status, validation result.
- `Benchmark`: test-set version, sample size, measured results, runtime and cost metadata.

## Security boundaries

- Start with demo targets that the team controls.
- Do not expose an unrestricted URL fetcher. When target endpoints are supported, enforce authorization, destination allowlists, request timeouts, response-size limits, and protections against access to loopback, private, link-local, and cloud metadata addresses.
- Store secrets server-side and redact them from logs.
- Separate a proposed patch from an applied patch; require explicit review for changes to target applications.
- Keep baseline and holdout test sets identifiable so reported improvements can be reproduced.
