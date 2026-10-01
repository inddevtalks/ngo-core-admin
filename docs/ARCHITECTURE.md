# NGOCORE Platform Admin — Architecture

> Org management, billing, compliance, support, and audit pages are implemented in `ngo-core-admin` + `PlatformModule`.

## Role in the System

The admin console is a **separate application** from `ngocore-frontend`, deployed on its own subdomain. It manages tenants (NGOs) at the platform level — not day-to-day NGO operations.

```
Platform Operator Browser
       │
       ▼
Cloudflare Pages (admin subdomain)
       │
       ├── Supabase Auth (admin allowlist)
       └── ngocore-backend API (platform_admin routes)
```

## Security Model

**Critical:** Admin auth must never share session or routes with NGO staff auth.

| Concern | Design |
|---------|--------|
| Auth separation | Separate Supabase project or email allowlist for platform admins |
| API authorization | Backend `platform_admin` role; bypasses org RLS via dedicated service role |
| Subdomain isolation | e.g. `admin.apnatech.in` — separate Cloudflare Pages project |
| MFA | Required for platform admins (follow-up) |
| Audit | All admin actions logged to `audit_logs` with target `org_id` |

## App Router Structure

```
app/
  (auth)/
    login/                              # Platform admin password login (allowlisted)
  (platform)/
    platform/                           # Overview: active orgs, alerts
    platform/organizations/             # Tenant list, create, suspend
    platform/organizations/new/         # Org onboarding wizard
    platform/organizations/[orgId]/    # Detail: profile, team, status
    platform/billing/                   # Plans, usage, plan assignment
    platform/compliance-monitor/        # Cross-tenant compliance + Form 10BD readiness
    platform/support/                   # Lookup, audited access request, export assist
    platform/audit/                     # Cross-tenant audit log
```

## Platform Admin Capabilities

| Feature | Status | Description |
|---------|--------|-------------|
| Org onboarding | Shipped | Create org, assign/invite owner, set PAN/FCRA/80G |
| Org suspend/reinstate | Shipped | Toggle `organizations.status` via platform API |
| Org list + detail | Shipped | Cross-tenant list, search, filters, team/compliance tabs |
| Compliance dashboard | Shipped | Gap alerts + Form 10BD readiness counters |
| Billing management | Shipped | Plan tiers in `settings.billing`, usage meters |
| Support tools | Shipped | Audited lookup / access request / export assist (no live impersonation) |
| Audit log | Shipped | Searchable cross-tenant `audit_logs` viewer |

## API Integration

Admin routes are **not** org-scoped. Backend exposes:

```
GET    /api/v1/platform/overview
GET    /api/v1/platform/billing
PATCH  /api/v1/platform/organizations/:id/billing
GET    /api/v1/platform/audit-logs
GET    /api/v1/platform/support/lookup
POST   /api/v1/platform/organizations/:id/support/access-request
POST   /api/v1/platform/organizations/:id/support/export-assist
GET    /api/v1/platform/organizations
POST   /api/v1/platform/organizations
GET    /api/v1/platform/organizations/:id
PATCH  /api/v1/platform/organizations/:id
PATCH  /api/v1/platform/organizations/:id/status
POST   /api/v1/platform/organizations/:id/owner
GET    /api/v1/platform/organizations/:id/members
GET    /api/v1/platform/compliance/alerts
GET    /api/v1/platform/compliance/export-readiness
```

Guarded by `PlatformAdminGuard` (email allowlist: `PLATFORM_ADMIN_EMAILS` / `SUPERADMIN_EMAIL`). Uses the service DB connection (bypasses tenant membership listing).

## Deployment Plan

| Setting | Value |
|---------|-------|
| Platform | Cloudflare Pages (separate project) |
| Domain | e.g. `admin.apnatech.in` |
| Build | Same as frontend (`@cloudflare/next-on-pages`) |
| Access | IP allowlist optional |

## Shared Packages

Same as frontend — `@ngocore/types` for domain interfaces, `@ngocore/ui` for shared components (follow-up).

## Related Documents

- [Backend Architecture](../../ngocore-backend/docs/ARCHITECTURE.md)
- [Compliance Requirements](../../ngocore-backend/docs/COMPLIANCE.md)
- [ADR: Tenancy + RLS](../../ngocore-backend/docs/adr/001-tenancy-rls.md)
- [Frontend Architecture](../../ngocore-frontend/docs/ARCHITECTURE.md)
- [Tenant product map](../../ngocore-backend/docs/PRODUCT.md)
