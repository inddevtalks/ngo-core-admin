# NGOCORE Platform Admin — Architecture

> Planning document only. Implementation not started.

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
| MFA | Required for platform admins (Phase 2) |
| Audit | All admin actions logged to `audit_logs` with `org_id = NULL` or target org |

## Planned App Router Structure

```
app/
  (auth)/
    login/                              # Platform admin OTP (allowlisted emails)
  (platform)/
    platform/                           # Overview: active orgs, alerts
    platform/organizations/             # Tenant list, create, suspend
    platform/organizations/new/         # Org onboarding wizard
    platform/billing/                   # Subscription/plan management (Phase 2)
    platform/compliance-monitor/        # Cross-tenant compliance status
```

## Platform Admin Capabilities

| Feature | Phase | Description |
|---------|-------|-------------|
| Org onboarding | 1 | Create org, assign owner, set PAN/FCRA fields |
| Org suspend/reinstate | 1 | Toggle `organizations.status` |
| Compliance dashboard | 2 | Orgs missing 80G cert, FCRA violations |
| Billing management | 2 | Plan tiers, usage metering |
| Support tools | 3 | Impersonation (audited), data export assist |

## API Integration

Admin routes are **not** org-scoped. Backend must expose separate endpoints:

```
GET  /api/v1/platform/organizations
POST /api/v1/platform/organizations
PATCH /api/v1/platform/organizations/:id/status
GET  /api/v1/platform/compliance/alerts
```

These routes use a service-level DB connection or RLS bypass role — never reuse org-member JWT context.

## Deployment Plan

| Setting | Value |
|---------|-------|
| Platform | Cloudflare Pages (separate project) |
| Domain | e.g. `admin.apnatech.in` |
| Build | Same as frontend (`@cloudflare/next-on-pages`) |
| Access | IP allowlist optional (Phase 2) |

## Shared Packages

Same as frontend — `@ngocore/types` for domain interfaces, `@ngocore/ui` for shared components (Phase 2).

## Phase Plan

| Phase | Scope |
|-------|-------|
| **Phase 0** | Spec review, admin API routes in OpenAPI |
| **Phase 1** | Login, org list/create, suspend/reinstate |
| **Phase 2** | Compliance monitor, billing shell |
| **Phase 3** | Support tools, MFA enforcement |

## Related Documents

- [Backend Architecture](../../ngocore-backend/docs/ARCHITECTURE.md)
- [Compliance Requirements](../../ngocore-backend/docs/COMPLIANCE.md)
- [ADR: Tenancy + RLS](../../ngocore-backend/docs/adr/001-tenancy-rls.md)
- [Frontend Architecture](../ngocore-frontend/docs/ARCHITECTURE.md)
