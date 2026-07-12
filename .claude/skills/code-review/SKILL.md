---
name: full-stack-code-review
description: Code quality review skill for this project's PHP/Laravel/JS full-stack code. Checks SOLID/DRY/KISS adherence, Laravel layering (Controller -> Service -> Repository -> Model), naming conventions, N+1 queries, error handling, and test coverage. Use on diffs to catch maintainability and correctness issues before merge.
---

# Full-Stack Code Review

You are reviewing code from a senior full-stack engineer's perspective. Focus on correctness, maintainability, and consistency with this project's conventions — not on rewriting working code to taste.

## Review Checklist

### Code Quality

- SOLID, DRY, KISS, YAGNI, separation of concerns.
- No duplicated logic — flag repeated blocks that should be a shared function/service.
- Functions do one thing; flag functions mixing unrelated responsibilities.
- No magic numbers/strings — should be named constants or config.
- Descriptive names over abbreviations (`UserController`, `CreateUserRequest`, `UserService`, `UserRepository`, not shortened forms).

### Laravel / Backend Architecture

- Controllers stay thin: `Controller -> Service -> Repository -> Model`. Flag business logic living in controllers or views.
- Form Requests used for validation, not inline `$request->validate()` sprinkled through controllers.
- Route model binding used where applicable.
- Eloquent relationships use eager loading (`with()`); flag N+1 query patterns (a query inside a loop over a relationship).
- Policies used for authorization checks rather than ad-hoc conditionals.

### JavaScript

- Modern ES6+: `const`/`let`, arrow functions, modules, `async`/`await`.
- No global variables; no callback pyramids where `async`/`await` would do.
- No inline JS in HTML.

### API Consistency

- Correct HTTP verbs (GET/POST/PUT/PATCH/DELETE) matching the operation's semantics.
- Consistent JSON response shape (`success`, `message`, `data`) across endpoints.
- Proper status codes for validation errors, auth errors, and unexpected errors — not everything returning 200 or 500.

### Error Handling

- User-facing errors are friendly messages; internal exceptions are logged, not shown to the client.
- No swallowed exceptions (empty `catch` blocks) that hide real failures.

### Testing

- New logic has corresponding unit/feature tests.
- Edge cases, validation failures, and authorization failures are covered, not just the happy path.

### Naming & Structure

- Consistent naming across the change (matches existing `*Controller`, `*Request`, `*Service`, `*Repository`, `*Policy` patterns).
- Files land in the right layer/folder (components, services, repositories, models, controllers) rather than dumped in one place.

### Git Hygiene (when reviewing a PR/series of commits)

- Commits are atomic and messages are meaningful.
- No secrets, `.env` values, or generated files committed.

## What NOT to flag

- Style preferences already enforced by a linter/formatter.
- Working code that doesn't match a "nicer" hypothetical rewrite — only flag it if it's actually a bug, a duplication, or a maintainability risk.
- Missing features or hardening beyond what the diff's scope calls for.

## Output format

List findings ranked most-important first. For each: file/line, what's wrong, why it matters (bug vs. maintainability vs. duplication), and the concrete fix. Skip filler praise — report only what needs attention.
