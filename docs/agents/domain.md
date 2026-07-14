# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

## Layout

This is a multi-context repo with separate frontend and backend contexts:

- `frontend/CONTEXT.md` - frontend domain language, UI rules, and client-side concepts.
- `backend/CONTEXT.md` - backend domain language, .NET service rules, persistence concepts, and API concepts.
- `docs/adr/` - system-wide architectural decisions.
- `frontend/docs/adr/` - frontend-specific decisions, when present.
- `backend/docs/adr/` - backend-specific decisions, when present.

## Before exploring, read these

- **`CONTEXT-MAP.md`** at the repo root if it exists - it points at one `CONTEXT.md` per context. Read each one relevant to the topic.
- **`frontend/CONTEXT.md`** when working on frontend code, UI behavior, client-side state, routing, styling, or frontend tests.
- **`backend/CONTEXT.md`** when working on backend code, .NET APIs, persistence, authentication, background jobs, backend tests, or migrations.
- **`docs/adr/`** for decisions that affect the whole system.
- **`frontend/docs/adr/`** and **`backend/docs/adr/`** for context-specific decisions that touch the area you're about to work in.

If any of these files don't exist, **proceed silently**. Don't flag their absence; don't suggest creating them upfront. The `/domain-modeling` skill (reached via `/grill-with-docs` and `/improve-codebase-architecture`) creates them lazily when terms or decisions actually get resolved.

## File structure

```
/
+-- CONTEXT-MAP.md
+-- docs/adr/
+-- frontend/
|   +-- CONTEXT.md
|   +-- docs/adr/
+-- backend/
    +-- CONTEXT.md
    +-- docs/adr/
```

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the term as defined in `CONTEXT.md`. Don't drift to synonyms the glossary explicitly avoids.

If the concept you need isn't in the glossary yet, that's a signal - either you're inventing language the project doesn't use (reconsider) or there's a real gap (note it for `/domain-modeling`).

## Flag ADR conflicts

If your output contradicts an existing ADR, surface it explicitly rather than silently overriding:

> _Contradicts ADR-0007 (event-sourced orders) - but worth reopening because..._
