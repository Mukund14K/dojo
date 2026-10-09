# DOJO backend (planned)

The Django backend has not been initialized yet. This directory is reserved for the upcoming Django + Django REST Framework API.

## Planned responsibilities

- Project, target, and policy APIs
- Arena orchestration and run status
- Attack execution and result storage
- Vulnerability grouping and patch records
- Benchmark and report APIs
- Server-side AI model and job-provider integrations

## Initial implementation order

1. Create the Django project and configuration.
2. Configure a server-side connection to Supabase PostgreSQL.
3. Add project/target/policy models and Django migrations.
4. Implement and test the project CRUD endpoints.
5. Connect the existing React project form and list to the API.

Keep all database credentials and model API keys on the backend. See `../docs/ARCHITECTURE.md` and `../docs/ROADMAP.md`.
