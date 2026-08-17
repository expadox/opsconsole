# OpsConsole

A lightweight internal ops dashboard. Built as **Product B** for the
Expadox Portfolio Product Security track, covering Projects 4 to 6:
Zero-Trust Admin Access and Secrets Management, Cloud and IaC
Hardening, and Go-Live Governance.

## Why this app
LedgerLite (Product A) proved code can be written securely. OpsConsole
teaches the other half of the job: locking down *who can get in* to a
system that holds real privilege, user management, environment
configuration, feature flags. This is the shape of app that gets
breached through the front door, not through a code-level bug, exactly
what Projects 4 to 6 need to be real about.

## What it is
- **Team directory**: invite via Clerk, view roles, deactivate or
  reactivate, change roles, ADMIN only for mutations, OPERATOR can view
- **Environment config panel**: edit non-secret settings (feature
  flags, display name, support email), ADMIN only, a stand-in for the
  kind of admin panel that, in a real breach, is the first thing an
  attacker goes for
- **Audit log**: every privileged action recorded with actor, action,
  target, and before and after metadata, visible to both roles
- Everything lives behind `/admin`, no public-facing pages beyond a
  minimal sign-in screen

Deliberately thin feature set. The point of this product is the access
path to it, Cloudflare Access, Project 4, not what it does once you're
in, keep the feature surface intentionally small.

---

## Tech stack, all third-party, free tier, no self-managed cloud

| Layer | Service | Why |
|---|---|---|
| Frontend and backend | **Next.js** on **Vercel** free tier | Same zero-ops deploy pattern as LedgerLite |
| Auth | **Clerk** free tier | Handles the underlying login; zero-trust access sits in front of the whole app, not instead of Clerk |
| Database | **Neon** (Postgres) free tier, via Prisma | User directory, config values, audit log |
| Zero-trust access | **Cloudflare Access** (Cloudflare Zero Trust free tier, up to 50 users) | The actual point of Product B: `/admin` sits behind Cloudflare's identity-aware proxy, so reaching it at all requires a Cloudflare Access policy decision (email domain, one-time PIN, or an identity provider), not just a Clerk session. No VPN, no self-managed bastion host |
| DNS and edge | **Cloudflare** free tier | DNS, WAF rules, security headers, same account as Access |
| Secrets | **Doppler** free tier | Introduced properly here, not just Vercel env vars, since Project 4 is specifically about secrets management and rotation workflow |
| CI and CD | **GitHub Actions** free tier | IaC and config scanning for Project 5, reusing the SAST and secrets pattern from LedgerLite |
| CSPM-style posture check | **Checkov** (open source, runs in CI, free) | Scans the Cloudflare and Vercel config expressed as code, no paid CSPM tool needed at this scale |

Total cost: **$0**. Cloudflare Access free tier covers up to 50 seats,
comfortably enough for a portfolio demo.

---

## Deploy steps (zero overhead)

### 1. Repo, database, auth
```bash
npm install
cp .env.example .env.local   # fill in DATABASE_URL and Clerk keys
npx prisma migrate dev --name init
npm run dev
```
Same pattern as LedgerLite: create the Neon database, get Clerk keys,
run migrations. First user to sign in becomes OPERATOR by default (see
`lib/auth.ts`). Promote yourself to ADMIN directly in the database for
local dev:
```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'you@example.com';
```

### 2. Cloudflare Access (the actual point of this product)
1. Sign up for Cloudflare (free), add the domain the Vercel app will
   sit behind (a subdomain works, e.g. `ops.yourdomain.com`)
2. In the Cloudflare dashboard, go to Zero Trust, Access, Applications
3. Create an Application pointing at your OpsConsole domain, path
   `/admin*`
4. Define a policy: allow only specific emails or an email domain
   (e.g. your own), require a one-time PIN or connect an identity
   provider
5. Now `/admin` requires passing Cloudflare's identity check *before*
   the request even reaches Vercel, this is the zero-trust layer
   Project 4 builds and documents

### 3. Secrets, Doppler
1. Sign up at doppler.com (free tier)
2. Create a project, add `DATABASE_URL`, `CLERK_SECRET_KEY`, etc.
   there instead of directly in Vercel
3. Use Doppler's Vercel integration (or CLI) to sync secrets at build
   time, this gives Project 4 a real rotation and access-scoping story
   to document, which plain Vercel env vars don't

### 4. Deploy, Vercel
Import the repo, Vercel auto-detects Next.js.

### 5. CI, IaC and config scanning
`.github/workflows/security.yml` runs the same Semgrep, Gitleaks, and
SBOM pipeline as LedgerLite, with a Checkov step ready for Project 5's
IaC scanning once config-as-code exists in the repo.

---

## Where the security work lives
- `lib/auth.ts`, the authorization chokepoint. Note the explicit
  `DeactivatedError`, Cloudflare Access controls who can *reach* the
  app, this file controls what an authenticated session is *allowed to
  do*. Treating those as the same thing is the mistake this product
  exists to correct.
- `lib/audit.ts`, the single write path for the audit log. No route
  handler writes to `AuditLog` directly.
- `app/api/team/[id]/route.ts`, note the self-modification block: an
  admin cannot deactivate or demote their own account through this
  route.
- `app/api/team/route.ts`, invites always create new users as OPERATOR
  regardless of the role requested at invite time; granting ADMIN is a
  deliberate second step, not a side effect of an invite.

---

## What each project pulls from this repo
- **Project 4, Zero-Trust Admin Access and Secrets Management**: the
  Cloudflare Access setup above, plus the Doppler secrets migration and
  a rotation runbook
- **Project 5, Cloud and IaC Hardening**: CSPM-style posture check on
  the Cloudflare and Vercel configuration, IaC scanning if config is
  expressed as Terraform, edge hardening (WAF rules, security headers,
  TLS settings)
- **Project 6, Go-Live Governance**: final vulnerability scan gate,
  go-live checklist, prod access review (who actually has Cloudflare,
  Vercel, and Doppler access), incident response readiness

## Known simplifications
- Invitations request a role via `publicMetadata`, but the actual
  grant still requires a second, explicit admin action after the
  invited user's first sign-in, intentional, not a bug, see Project 4's
  access governance work
- Config values are treated as non-secret by design; anything secret
  belongs in Doppler, never in `ConfigSetting`
- No rate limiting on the API routes in this repo, deferred to
  Cloudflare's edge layer, same pattern as LedgerLite

## Total cost to deploy and run this
$0, same as LedgerLite. Cloudflare Access, Doppler, Neon, Clerk, and
Vercel all have free tiers that comfortably cover this.