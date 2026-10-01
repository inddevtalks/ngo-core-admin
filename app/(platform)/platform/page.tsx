"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Building2, CreditCard, LifeBuoy, Plus, ScrollText, ShieldAlert } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CardGridSkeleton } from "@/components/ui/table-skeleton";
import { toast } from "@/components/ui/toaster";
import { ROUTES } from "@/constants/routes";
import { createAuthedApi } from "@/lib/api";
import type { PlatformOverview, PlatformOrganization } from "@/lib/api/platform";

export default function PlatformOverviewPage() {
  const [stats, setStats] = useState<PlatformOverview | null>(null);
  const [recent, setRecent] = useState<PlatformOrganization[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const api = createAuthedApi();
    Promise.all([
      api.platform.overview(),
      api.platform.listOrganizations({ page: 1, pageSize: 5 }),
    ])
      .then(([overview, list]) => {
        if (cancelled) return;
        setStats(overview);
        setRecent(list.data ?? []);
      })
      .catch((err) => {
        if (!cancelled) {
          toast.error(err instanceof Error ? err.message : "Failed to load overview.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AppShell
      title="Platform overview"
      description="Tenant health across all NGOs on NGOCore."
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-2xl text-sm text-neutral-500">
          Cross-tenant org onboarding, suspend/reinstate, and compliance signals for platform
          operators.
        </p>
        <Link href={ROUTES.ORGANIZATION_NEW}>
          <Button>
            <Plus className="h-4 w-4" />
            Onboard organization
          </Button>
        </Link>
      </div>

      {loading || !stats ? (
        <CardGridSkeleton cards={4} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Organizations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-neutral-900">{stats.total}</p>
              <p className="text-sm text-neutral-500">{stats.draft} draft</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-emerald-700">{stats.active}</p>
              <p className="text-sm text-neutral-500">
                {stats.verified} verified · {stats.compliant} compliant
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Suspended</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-amber-700">{stats.suspended}</p>
              <p className="text-sm text-neutral-500">Require reinstate</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Compliance gaps</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-amber-700">{stats.complianceGaps}</p>
              <p className="text-sm text-neutral-500">
                {stats.missingPan} missing PAN · {stats.missingEightyG} missing 80G
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent organizations</CardTitle>
            <Link
              href={ROUTES.ORGANIZATIONS}
              className="text-sm font-medium text-primary-700 hover:underline"
            >
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-neutral-500">Loading…</p>
            ) : recent.length === 0 ? (
              <div className="flex flex-col items-start gap-3 py-4">
                <Building2 className="h-8 w-8 text-neutral-300" />
                <p className="text-sm text-neutral-500">No organizations yet.</p>
                <Link href={ROUTES.ORGANIZATION_NEW}>
                  <Button size="sm">Create first organization</Button>
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-[#dfeae7]">
                {recent.map((org) => (
                  <li key={org.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <Link
                        href={`${ROUTES.ORGANIZATIONS}/${org.id}`}
                        className="truncate font-medium text-neutral-900 hover:text-primary-700"
                      >
                        {org.name}
                      </Link>
                      <p className="truncate text-xs text-neutral-500">
                        {org.status} · {org.ownerEmail || "No owner yet"} · {org.pan || "No PAN"}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link
              href={ROUTES.ORGANIZATIONS}
              className="flex items-center gap-3 rounded-xl border border-[#dfeae7] px-4 py-3 text-sm font-medium text-neutral-800 transition-colors hover:bg-[#f8faf9]"
            >
              <Building2 className="h-5 w-5 text-primary-700" />
              Manage organizations
            </Link>
            <Link
              href={ROUTES.COMPLIANCE}
              className="flex items-center gap-3 rounded-xl border border-[#dfeae7] px-4 py-3 text-sm font-medium text-neutral-800 transition-colors hover:bg-[#f8faf9]"
            >
              <ShieldAlert className="h-5 w-5 text-primary-700" />
              Compliance monitor
            </Link>
            <Link
              href={ROUTES.BILLING}
              className="flex items-center gap-3 rounded-xl border border-[#dfeae7] px-4 py-3 text-sm font-medium text-neutral-800 transition-colors hover:bg-[#f8faf9]"
            >
              <CreditCard className="h-5 w-5 text-primary-700" />
              Billing & plans
            </Link>
            <Link
              href={ROUTES.SUPPORT}
              className="flex items-center gap-3 rounded-xl border border-[#dfeae7] px-4 py-3 text-sm font-medium text-neutral-800 transition-colors hover:bg-[#f8faf9]"
            >
              <LifeBuoy className="h-5 w-5 text-primary-700" />
              Support tools
            </Link>
            <Link
              href={ROUTES.AUDIT}
              className="flex items-center gap-3 rounded-xl border border-[#dfeae7] px-4 py-3 text-sm font-medium text-neutral-800 transition-colors hover:bg-[#f8faf9]"
            >
              <ScrollText className="h-5 w-5 text-primary-700" />
              Audit log
            </Link>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
