"use client";

import { useEffect, useMemo, useState } from "react";
import { Eye, Search } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DEFAULT_LIST_PAGE_SIZE,
  LIST_PAGE_SIZE_OPTIONS,
  TableIconLink,
  TableStatusBadge,
  tableHeadClass,
  tableRowClass,
} from "@/components/ui/list-table";
import { Pagination } from "@/components/ui/pagination";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { toast } from "@/components/ui/toaster";
import { organizationDetail } from "@/constants/routes";
import { createAuthedApi } from "@/lib/api";
import type {
  PlatformComplianceAlerts,
  PlatformExportReadiness,
} from "@/lib/api/platform";
import { orgStatusBadgeClass, orgStatusLabel } from "@/lib/org-labels";

export default function ComplianceMonitorPage() {
  const [data, setData] = useState<PlatformComplianceAlerts | null>(null);
  const [readiness, setReadiness] = useState<PlatformExportReadiness | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_LIST_PAGE_SIZE);

  useEffect(() => {
    let cancelled = false;
    const api = createAuthedApi();
    Promise.all([api.platform.complianceAlerts(), api.platform.exportReadiness()])
      .then(([alerts, exportReady]) => {
        if (cancelled) return;
        setData(alerts);
        setReadiness(exportReady);
      })
      .catch((err) => {
        if (!cancelled) {
          toast.error(err instanceof Error ? err.message : "Failed to load compliance alerts.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredAlerts = useMemo(() => {
    const alerts = data?.alerts ?? [];
    const needle = searchTerm.trim().toLowerCase();
    if (!needle) return alerts;
    return alerts.filter((alert) =>
      [alert.name, alert.status, ...alert.issues]
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }, [data, searchTerm]);

  const pageCount = Math.max(1, Math.ceil(filteredAlerts.length / pageSize));
  const visibleAlerts = filteredAlerts.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => setPage(1), [searchTerm, pageSize]);

  return (
    <AppShell
      title="Compliance monitor"
      description="Cross-tenant 80G, FCRA, PAN, Form 10BD readiness, and suspension signals."
    >
      <div className="mb-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Organizations scanned" value={data?.totalOrganizations} />
        <MetricCard title="With alerts" value={data?.alertCount} tone="amber" />
        <MetricCard
          title="Form 10BD ready"
          value={readiness?.form10bdReady}
          tone="emerald"
          hint={
            readiness
              ? `${readiness.form10bdBlocked} blocked · ${readiness.totalNonDraft} non-draft`
              : undefined
          }
        />
        <MetricCard
          title="FCRA registered"
          value={readiness?.fcraRegistered}
          hint={
            readiness
              ? `${readiness.missingPan} missing PAN · ${readiness.missingEightyG} missing 80G`
              : undefined
          }
        />
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base">Form 10BD assist</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
            <p className="text-sm leading-relaxed text-neutral-600">
              {readiness?.form10bdNote ??
                "Automated Form 10BD batch export is Phase 2. Tenants with PAN + 80G are marked ready for assisted export."}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base">DPDP</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
            <p className="text-sm leading-relaxed text-neutral-600">
              {readiness?.dpdpConsentNote ??
                "DPDP consent export/delete APIs remain Phase 2; audit logs support incident response today."}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="gap-4 space-y-0 p-4 sm:p-6">
          <div className="min-w-0">
            <CardTitle className="text-base font-semibold text-neutral-900">Alerts</CardTitle>
            <p className="mt-1 text-sm text-neutral-500">
              {filteredAlerts.length} of {data?.alerts.length ?? 0} alert
              {(data?.alerts.length ?? 0) === 1 ? "" : "s"}
            </p>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative min-w-0 w-full sm:max-w-sm lg:max-w-md">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search organization or issue…"
                className="h-9 w-full rounded-xl border border-[#dfeae7] bg-white py-2 pl-10 pr-4 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-primary-600"
              />
            </div>
            <div className="shrink-0 lg:ml-4">
              <Pagination
                compact
                page={page}
                pageCount={pageCount}
                total={filteredAlerts.length}
                onPageChange={setPage}
                pageSize={pageSize}
                pageSizeOptions={LIST_PAGE_SIZE_OPTIONS}
                onPageSizeChange={setPageSize}
                itemLabel="alerts"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? <TableSkeleton columns={4} rows={6} /> : null}

          {!loading ? (
            <>
              <div className="space-y-3 p-3 md:hidden">
                {visibleAlerts.map((alert) => (
                  <div
                    key={alert.orgId}
                    className="rounded-xl border border-[#dfeae7] bg-white p-3 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-neutral-900">{alert.name}</p>
                        <p className="mt-0.5 text-sm text-neutral-500">{alert.issues.join(" · ")}</p>
                      </div>
                      <TableIconLink
                        href={organizationDetail(alert.orgId)}
                        label="View organization"
                      >
                        <Eye className="h-4 w-4" />
                      </TableIconLink>
                    </div>
                    <div className="mt-3">
                      <TableStatusBadge className={orgStatusBadgeClass(alert.status)}>
                        {orgStatusLabel(alert.status)}
                      </TableStatusBadge>
                    </div>
                  </div>
                ))}
              </div>

              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className={tableHeadClass}>
                    <tr>
                      {["Organization", "Status", "Issues", "Actions"].map((heading) => (
                        <th key={heading} className="px-4 py-3 font-semibold">
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {visibleAlerts.map((alert) => (
                      <tr key={alert.orgId} className={tableRowClass}>
                        <td className="px-4 py-3 font-medium text-neutral-900">{alert.name}</td>
                        <td className="px-4 py-3">
                          <TableStatusBadge className={orgStatusBadgeClass(alert.status)}>
                            {orgStatusLabel(alert.status)}
                          </TableStatusBadge>
                        </td>
                        <td className="px-4 py-3 text-neutral-700">{alert.issues.join(" · ")}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <TableIconLink
                              href={organizationDetail(alert.orgId)}
                              label="View organization"
                            >
                              <Eye className="h-4 w-4" />
                            </TableIconLink>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {visibleAlerts.length === 0 ? (
                <p className="p-6 text-sm text-neutral-500">
                  {data?.alerts.length ? "No alerts match this search." : "No compliance alerts."}
                </p>
              ) : null}
            </>
          ) : null}
        </CardContent>
      </Card>
    </AppShell>
  );
}

function MetricCard({
  title,
  value,
  hint,
  tone,
}: {
  title: string;
  value?: number;
  hint?: string;
  tone?: "amber" | "emerald";
}) {
  const valueClass =
    tone === "amber"
      ? "text-amber-700"
      : tone === "emerald"
        ? "text-emerald-700"
        : "text-neutral-900";

  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
        <p className={`text-3xl font-semibold ${valueClass}`}>{value ?? "—"}</p>
        {hint ? <p className="text-sm text-neutral-500">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}
