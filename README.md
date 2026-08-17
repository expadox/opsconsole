# OpsConsole

Internal ops dashboard. Built as Product B for the Expadox Portfolio
Product Security track, covering Projects 4-6: Zero-Trust Admin Access &
Secrets Management, Cloud & IaC Hardening, Go-Live Governance.

Full product spec and the zero-overhead deploy walkthrough (Neon, Clerk,
Cloudflare Access, Doppler, Vercel) live in the companion doc
`opsconsole-spec-and-deploy-readme.md`. This README covers the code.

## What it is
- Team directory: invite (via Clerk), view roles, deactivate/reactivate,
  change roles — ADMIN only for mutations, OPERATOR can view
- Environment config panel: edit non-secret settings, ADMIN only
- Audit log: every privileged action recorded with actor, action, target,
  and before/after metadata — visible to both roles

Deliberately thin feature set. The point of this product is the access
path to it (Cloudflare Access, Project 4), not what it does once you're in.

## Where the security work lives
- `lib/auth.ts` — the authorization chokepoint. Note the explicit
  `DeactivatedError` — Cloudflare Access controls who can *reach* the app,
  this file controls what an authenticated session is *allowed to do*.
  Treating those as the same thing is the mistake this product exists to
  correct.
- `lib/audit.ts` — the single write path for the audit log. No route
  handler writes to `AuditLog` directly.
- `app/api/team/[id]/route.ts` — note the self-modification block: an
  admin cannot deactivate or demote their own account through this route.
- `app/api/team/route.ts` — invites always create new users as OPERATOR
  regardless of the role requested at invite time; granting ADMIN is a
  deliberate second step, not a side effect of an invite.
- `.github/workflows/security.yml` — same pipeline as LedgerLite, with a
  Checkov step ready for Project 5's IaC scanning once config-as-code
  exists in the repo.

## Local setup
```bash
npm install
cp .env.example .env.local   # fill in DATABASE_URL and Clerk keys
npx prisma migrate dev --name init
npm run dev
```

First user to sign in becomes OPERATOR by default (see `lib/auth.ts`).
Promote yourself to ADMIN directly in the database for local dev:
```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'you@example.com';
```

## Known simplifications
- Invitations request a role via `publicMetadata`, but the actual grant
  still requires a second, explicit admin action after the invited user's
  first sign-in — intentional, not a bug; see Project 4's access
  governance work
- Config values are treated as non-secret by design; anything secret
  belongs in Doppler, never in `ConfigSetting`
- No rate limiting on the API routes in this repo — deferred to
  Cloudflare's edge layer, same pattern as LedgerLite
