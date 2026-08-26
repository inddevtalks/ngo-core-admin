# NGOCORE Platform Admin — Architecture & Specs

APNA TECH (NGOCORE) console for platform operators — org onboarding, billing, compliance monitoring, and support. This repository currently holds **planning documents only**. Application code has not started.

## Documentation

| Document | Description |
|----------|-------------|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Admin app structure, security model, deployment plan |
| [Backend specs](../ngocore-backend/docs/ARCHITECTURE.md) | Shared system architecture (sibling repo) |
| [OpenAPI contract](../ngocore-backend/docs/specs/openapi.yaml) | API contract for spec-driven development |

## Planned Stack

- **Framework**: Next.js 15 (App Router) + TypeScript + Tailwind CSS
- **Auth**: Supabase Auth with platform-admin allowlist (separate from NGO staff)
- **API**: Backend admin routes gated by `platform_admin` role
- **Deploy**: Cloudflare Pages — **separate project/subdomain** from frontend

## Planned Users

APNA TECH internal staff only — not NGO org members.

## Related Repos

| Repo | Purpose |
|------|---------|
| `ngocore-backend` | API, database, platform admin endpoints |
| `ngocore-frontend` | NGO staff app |

## License

Proprietary — APNA TECH
