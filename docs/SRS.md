# Software Requirements Specification — DOJO

**Version:** 0.1 (initial requirements baseline)  
**Status:** Draft; intended functionality is not yet fully implemented.

## 1. Purpose

DOJO is intended to help developers evaluate the security behavior of AI applications by running authorized adversarial tests, analyzing policy violations, proposing defensive changes, and checking those changes using repeatable tests.

## 2. Scope

The initial release will support user-configured projects and targets, plain-language security policies, bounded test runs against controlled applications, structured evaluations, attack evolution, vulnerability records, patch proposals, and before/after benchmark reporting.

## 3. Users

- **Developer:** configures a target, runs tests, investigates findings, and reviews proposed patches.
- **Security tester:** manages test policies, scenarios, and benchmark runs.
- **Administrator:** manages application configuration and access controls.

The initial prototype may use one role, but access control must be designed before multi-user or hosted use.

## 4. Functional requirements

- **FR-01 Projects:** The system shall create, list, retrieve, update, and delete projects.
- **FR-02 Targets:** The system shall store configuration for explicitly authorized target applications.
- **FR-03 Policies:** The system shall store natural-language security policies and associated measurable checks.
- **FR-04 Arena:** The system shall start, track, cancel, and complete a test run with auditable status.
- **FR-05 Attack execution:** The system shall execute bounded test cases against an approved target and record execution metadata.
- **FR-06 Evaluation:** The system shall produce structured policy-evaluation results and retain the evidence needed to review them.
- **FR-07 Evolution:** The system shall associate attacks with generations and parent attacks, and support selection and mutation for subsequent generations.
- **FR-08 Vulnerabilities:** The system shall group related confirmed or suspected failures and distinguish hypotheses from verified findings.
- **FR-09 Patches:** The system shall record proposed defensive changes, review/application status, and validation evidence.
- **FR-10 Validation:** The system shall re-run relevant tests after a patch and report baseline/post-change outcomes.
- **FR-11 Metrics:** The system shall report sample size, confirmed policy violations, break rate, severity, false-positive measures, execution time, and relevant cost data where available.
- **FR-12 Reports:** The system shall provide a summary of the target, policy version, test configuration, findings, patches, and measured validation results.

## 5. Non-functional requirements

- **NFR-01 Security:** The system shall only test authorized targets and shall protect credentials from frontend exposure and logs.
- **NFR-02 Traceability:** Every result shall be linked to its arena, test case, target response, and evaluation.
- **NFR-03 Reliability:** Failed or timed-out jobs shall be recorded and shall not silently invalidate an entire run.
- **NFR-04 Reproducibility:** Benchmarks shall record test-set versions, configuration, sample size, and model/provider details where available.
- **NFR-05 Usability:** The interface shall show summary information first and reveal detailed evidence on demand.
- **NFR-06 Extensibility:** Attack categories and model providers should be addable without rewriting the core orchestration workflow.
- **NFR-07 Honest reporting:** Estimated, mock, and measured values shall be clearly distinguished.

## 6. Core data entities

Project, Target, Policy, Arena, Generation, Attack, AttackResult, Vulnerability, Patch, and Benchmark. See `ARCHITECTURE.md` for the planned relationships and security boundaries.

## 7. Acceptance criteria for the first MVP

1. A project can be created through the frontend and persisted through Django to PostgreSQL.
2. A test run can target a controlled demo application.
3. Each executed test has a traceable response and structured evaluation.
4. The system records at least two generations and their parent/child relationships.
5. A proposed defense can be reviewed and tested on the controlled target.
6. Baseline and post-change metrics are derived from recorded runs with explicit sample sizes.
7. The system documents evaluator limitations and does not claim that passing tests proves complete security.

## 8. Constraints and assumptions

- The current repository is a frontend prototype; backend capabilities in this specification are planned.
- Target integration must implement server-side protections against SSRF, unauthorized access, oversized responses, and excessive request volume.
- Model judgments may be incorrect and require calibration against human-reviewed samples.
- Patch generation does not imply that a patch has been applied or is safe to deploy.
