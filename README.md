# NGOCORE Platform Admin

Console for NGO CORE operators (tenant onboarding, billing, compliance monitoring).

## Auth

Email/password **superadmin** only. Seed from backend:

```bash
cd ../ngocore-backend
npm run seed:superadmin
```

| Field | Default |
|-------|---------|
| Email | `superadmin@ngocore.org` |
| Password | `SuperAdmin@123` |

## Pages

| Page | Path | Operations |
|------|------|------------|
| Overview | `/platform` | Tenant counts, recent orgs, quick links |
| Organizations | `/platform/organizations` | Search, status filters, suspend / reinstate / activate |
| Onboard wizard | `/platform/organizations/new` | Org → compliance → owner → review |
| Org detail | `/platform/organizations/[id]` | Profile, compliance fields, team/owner invite, status lifecycle |
| Billing | `/platform/billing` | Plan catalog, usage meters, assign tenant plan |
| Compliance | `/platform/compliance-monitor` | Cross-tenant alerts + Form 10BD readiness |
| Support | `/platform/support` | Audited tenant lookup, access request, export assist |
| Audit log | `/platform/audit` | Cross-tenant append-only action trail |

Backend APIs live under `/api/v1/platform/*` (see `docs/ARCHITECTURE.md`).

## Local run

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open http://localhost:3000/login (or whatever port Next assigns).

## Related

| Repo | Purpose |
|------|---------|
| `ngocore-backend` | API + `seed:superadmin` |
| `ngocore-frontend` | NGO staff app |
