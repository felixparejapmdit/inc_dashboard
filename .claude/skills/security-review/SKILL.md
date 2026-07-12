---
name: full-stack-security-review
description: Security review skill for this project's PHP/Laravel/JS full-stack code. Checks for SQL injection, XSS, CSRF, broken authentication/authorization, file upload risks, mass assignment, and sensitive data exposure. Use before merging changes that touch auth, forms, file uploads, database queries, or API endpoints.
---

# Full-Stack Security Review

You are reviewing code from a senior application-security perspective. Your goal is to find exploitable issues before they ship, not to nitpick style.

## When to use this skill

Run this review whenever a diff touches:

- Authentication, authorization, sessions, or policies
- Database queries (raw SQL, query builders, Eloquent)
- User-facing forms or API input
- File uploads
- Anything rendering user-generated content (HTML, templates, JS)

## Review Checklist

### Injection

- Never concatenate SQL strings. Every query must be parameterized (bound parameters / Eloquent query builder, not raw string interpolation).
- Never trust client input for query structure (column names, sort direction, table names) without an allow-list.

### Cross-Site Scripting (XSS)

- All user-generated content must be escaped on output (Blade `{{ }}`, not `{!! !!}`, unless the content is explicitly sanitized first).
- Never use inline JavaScript built from unescaped user input.

### Cross-Site Request Forgery (CSRF)

- State-changing requests (POST/PUT/PATCH/DELETE) must carry a valid CSRF token.
- Check that CSRF middleware isn't disabled for routes that shouldn't be exempt.

### Authentication & Authorization

- Passwords must be hashed (bcrypt/argon2 via Laravel's `Hash` facade), never stored or logged in plaintext.
- Every protected action must check authorization via Policies/Gates — don't rely on hiding UI elements alone.
- Verify ownership checks on resource access (a user editing `/orders/5` can't edit someone else's order just by changing the ID — IDOR).

### Mass Assignment

- Models must use `$fillable` (allow-list) rather than `$guarded = []`.
- Verify Form Requests validate and whitelist fields before they reach `create()`/`update()`.

### File Uploads

- Validate file type, extension, and MIME type (not just extension — spoofing is trivial).
- Enforce a max file size.
- Generate unique/random filenames; never trust the client-supplied filename.
- Store uploads outside the public webroot when possible, or block execution of scripts in the upload directory.

### Sensitive Data Exposure

- No secrets, API keys, or credentials committed to the repo or logged.
- Error responses must never leak stack traces, SQL, or internal paths in production (`APP_DEBUG=false`).
- Sensitive fields (passwords, tokens) must be excluded from API responses (`$hidden` on models).

### Input Validation

- All validation happens server-side; client-side validation is UX only, never a security control.
- Reject unexpected/extra fields rather than silently ignoring them where it matters.

## Output format

Report findings ranked by severity (critical/high/medium/low), each with:
- The file and line
- The concrete attack scenario (what input, what happens)
- The fix

Don't report theoretical issues with no realistic exploitation path — focus on what's actually reachable given the code's context.
