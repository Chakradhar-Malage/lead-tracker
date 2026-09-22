# AGENT.md

This document describes how AI was used in building this project, as required
by the assignment brief.

## AI tools used

- **Claude (Anthropic)**, used conversationally in Claude.ai, as a pair
  programmer for the whole project — scaffolding, implementation, tests,
  config, and this documentation.

No other AI coding tools (Copilot, Cursor, etc.) were used.

## How the work was split

I drove the product and technical decisions; Claude did most of the typing,
under my direction and review. Concretely:

**I decided:**
- The stack: FastAPI (backend), PostgreSQL, deployed on Render — chosen from
  the options in the brief based on what I'm most comfortable maintaining
  and debugging after submission.
- The data model and status values (`NEW`, `CONTACTED`, `QUALIFIED`,
  `CONVERTED`, `LOST`) — a standard lead-lifecycle set, not in the original
  brief.
- To drop `Base.metadata.create_all()` in favor of Alembic migrations, once
  Claude raised it as a trade-off — I agreed this is the more defensible
  choice for something meant to demonstrate real engineering judgment,
  even though it's more setup than strictly necessary for an app this size.
- To keep the frontend dependency-free (no component library, no state
  management library) given how small the app's state actually is.
- The overall visual direction ("Ledger" — treat the tool as a register/
  ledger book rather than a generic SaaS dashboard) — Claude proposed this
  and I picked it over the alternative generic dashboard look.
- Final review of all code, running the test suites myself, and reading
  through the diffs commit-by-commit rather than accepting everything
  blind.

**Claude generated, and I reviewed/tested:**
- All backend code: FastAPI app, SQLAlchemy models, Pydantic schemas, CRUD
  layer, router, Alembic migration, Dockerfile.
- All backend tests (`backend/app/tests/`) — I read through these and spot-
  checked a few by temporarily breaking the corresponding endpoint to
  confirm they actually fail when they should.
- All frontend code: components, API client, CSS, `App.tsx` state wiring.
- Frontend tests (Vitest + React Testing Library).
- `render.yaml`, the GitHub Actions CI workflow, and this README/AGENT.md.

I did not hand-write the implementation from scratch, but I did not accept
it uncritically either — see "Key engineering decisions" below for a few
places where I pushed back on or changed Claude's first pass.

## Representative prompts

These aren't verbatim, but reflect the actual shape of the conversation:

1. "Build a Lead Tracker app per this assignment brief. Ask me what stack
   I want first." → led to a short clarifying-question round (backend
   framework, database, deployment target) before any code was written.
2. "Start scaffolding" → backend structure, one logical commit per layer
   (config → models/schemas → CRUD/router → tests → migrations/Docker).
3. "Continue" (repeated) → frontend scaffold, design direction, components,
   tests, deployment config, this documentation — each as its own commit.
4. Throughout, I asked Claude to actually run the code (start the server,
   curl the endpoints, run `pytest`/`vitest`, run `tsc`/`vite build`) rather
   than just writing it, specifically so that what's committed has been
   verified to work rather than only "looking correct."

## Key engineering decisions (and why)

- **Alembic over `create_all()`.** `create_all()` is faster to set up but
  silently diverges from what a real deploy needs (reviewable, reversible
  schema changes). Given the brief explicitly evaluates code quality, I
  chose the slightly heavier but more defensible option.
- **SQLite for tests, Postgres for production.** Keeps CI fast and removes
  a Postgres dependency from every contributor's machine and from GitHub
  Actions, at the cost of not exercising Postgres-specific behavior (e.g.
  the native `ENUM` type) in the automated test suite. I mitigated this by
  manually running the Alembic migration against a real file-based SQLite
  DB during development to sanity-check the DDL, and by keeping the schema
  intentionally simple.
- **Optimistic status updates in the UI**, rolled back on API failure.
  Status changes are likely the single most frequent action in this app,
  so it felt worth the added client-side complexity to make that action
  feel instant.
- **No auth.** Out of scope for the brief; called out explicitly in the
  README's trade-offs and future-improvements sections rather than silently
  omitted.

## What I'd flag to a reviewer

- The commit history reflects the actual build order (backend layer by
  layer, then frontend, then deploy config, then docs) rather than being
  artificially split after the fact.
- Anywhere the README says something is untested or a known limitation
  (e.g. no pagination in the UI, free-tier cold starts on Render), that's
  accurate as of submission — I didn't want AI-assisted development to
  translate into overstated claims about what's actually finished.
