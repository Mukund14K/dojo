# DOJO Development Roadmap

The stages below are ordered milestones, not claims that the features are already implemented.

## Stage 0 — Repository foundation

- [x] Organize the existing frontend for GitHub
- [x] Add project documentation and frontend CI
- [ ] Establish the first baseline build/typecheck result in CI

## Stage 1 — Django and Supabase connection

- [ ] Create Django project and Django REST Framework configuration
- [ ] Configure a server-side Supabase PostgreSQL connection
- [ ] Add `Project`, `Target`, and `Policy` models
- [ ] Run migrations and add API tests
- [ ] Expose health and project CRUD endpoints
- [ ] Connect React project creation and listing to those endpoints

## Stage 2 — Controlled support-bot target

- [ ] Implement a local, intentionally vulnerable demo support bot
- [ ] Define policies with measurable outcomes
- [ ] Create a small human-reviewed test set
- [ ] Record target requests and responses safely

## Stage 3 — First attack/evaluation vertical slice

- [ ] Execute predefined tests against the demo target
- [ ] Persist each execution and result
- [ ] Integrate attack generation
- [ ] Integrate structured policy judging
- [ ] Compare model judgments against human labels

## Stage 4 — Arena and attack evolution

- [ ] Add arena lifecycle and run status
- [ ] Add generations, lineage, selection, mutation, and diversity checks
- [ ] Track timing, retries, failures, and token/cost metadata
- [ ] Stream or poll live status into the React UI

## Stage 5 — Vulnerability analysis and hardening

- [ ] Group related attack failures into vulnerability hypotheses
- [ ] Propose prompt, input-validation, or tool-permission defenses
- [ ] Review patches before applying them to controlled targets
- [ ] Re-run successful attacks and a separate holdout set
- [ ] Report break rate, false positives, regression failures, and sample size

## Stage 6 — Parallel execution and additional targets

- [ ] Add bounded background-job execution
- [ ] Integrate Nebius Serverless Jobs
- [ ] Measure wall-clock time and cost against a sequential baseline
- [ ] Add a controlled RAG target and tool-using agent
- [ ] Run comparable benchmarks across targets

## Stage 7 — Release readiness

- [ ] Authentication and per-project authorization
- [ ] Secret management and log redaction
- [ ] Rate limits, timeouts, retries, and cancellation
- [ ] CI tests and reproducible setup instructions
- [ ] Report export and final demo script

## MVP acceptance criteria

The first meaningful MVP is complete when a user can create a project, run a bounded test against a controlled target, inspect a traceable evaluation, evolve a later generation, review a proposed fix, and compare baseline versus post-fix results from recorded runs.
