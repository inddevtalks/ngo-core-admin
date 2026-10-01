"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Eye,
  Filter,
  Search,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
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
import { CardGridSkeleton, TableSkeleton } from "@/components/ui/table-skeleton";
import { toast } from "@/components/ui/toaster";
import { organizationDetail } from "@/constants/routes";
import { createAuthedApi } from "@/lib/api";
import type {
  PlatformBillingPlan,
  PlatformBillingSummary,
} from "@/lib/api/platform";
import { orgStatusBadgeClass, orgStatusLabel } from "@/lib/org-labels";

const PLAN_OPTIONS: PlatformBillingPlan[] = ["free", "starter", "growth", "enterprise"];

export default function BillingPage() {
  const [data, setData] = useState<PlatformBillingSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingOrgId, setSavingOrgId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [planFilter, setPlanFilter] = useState<PlatformBillingPlan | "all">("all");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_LIST_PAGE_SIZE);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const summary = await createAuthedApi().platform.billingSummary();
      setData(summary);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load billing.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const filteredTenants = useMemo(() => {
    if (!data) return [];
    const needle = searchTerm.trim().toLowerCase();
    return data.tenants.filter((tenant) => {
      const matchesPlan = planFilter === "all" || tenant.plan === planFilter;
      const matchesSearch =
        !needle ||
        [tenant.name, tenant.billingEmail, tenant.plan, tenant.status]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(needle);
      return matchesPlan && matchesSearch;
    });
  }, [data, planFilter, searchTerm]);

  const pageCount = Math.max(1, Math.ceil(filteredTenants.length / pageSize));
  const visibleTenants = filteredTenants.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => setPage(1), [searchTerm, planFilter, pageSize]);

  async function changePlan(orgId: string, plan: PlatformBillingPlan) {
    setSavingOrgId(orgId);
    try {
      await createAuthedApi().platform.updateBilling(orgId, { plan });
      toast.success("Plan updated.");
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update plan.");
    } finally {
      setSavingOrgId(null);
    }
  }

  return (
    <AppShell
      title="Billing"
      description="Subscription plans, usage meters, and upgrade triggers across tenants."
    >
      {loading || !data ? (
        <div className="space-y-4">
          <CardGridSkeleton cards={4} />
          <Card>
            <CardContent className="p-0">
              <TableSkeleton columns={5} rows={6} />
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
          <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              title="Tenants"
              value={data.totals.tenants}
              hint={`${data.totals.paid} paid · ${data.totals.free} free`}
            />
            <MetricCard title="Seats in use" value={data.totals.members} hint="Active org members" />
            <MetricCard
              title="Donations"
              value={data.totals.donations}
              hint="Across all tenants"
            />
            <MetricCard
              title="Beneficiaries"
              value={data.totals.beneficiaries}
              hint="Ops volume signal"
            />
          </div>

          <div className="mb-6 grid gap-4 lg:grid-cols-4">
            {data.plans.map((plan) => (
              <Card key={plan.id}>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-base">{plan.label}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 p-4 pt-0 sm:p-6 sm:pt-0">
                  <p className="text-2xl font-semibold text-neutral-900">
                    {plan.monthlyInr === 0 && plan.id !== "enterprise"
                      ? "₹0"
                      : plan.id === "enterprise"
                        ? "Custom"
                        : `₹${plan.monthlyInr.toLocaleString("en-IN")}`}
                    {plan.id !== "enterprise" && plan.monthlyInr > 0 ? (
                      <span className="text-sm font-normal text-neutral-500"> /mo</span>
                    ) : null}
                  </p>
                  <p className="text-sm text-neutral-500">
                    {plan.tenantCount} tenants · {plan.seats} seats
                  </p>
                  <ul className="space-y-1 text-sm text-neutral-600">
                    {plan.highlights.map((item) => (
                      <li key={item}>· {item}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader className="gap-4 space-y-0 p-4 sm:p-6">
              <div className="min-w-0">
                <CardTitle className="text-base font-semibold text-neutral-900">
                  Tenant plans
                </CardTitle>
                <p className="mt-1 text-sm text-neutral-500">
                  {filteredTenants.length} of {data.tenants.length} tenant
                  {data.tenants.length === 1 ? "" : "s"}
                </p>
              </div>

              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                  <div className="relative min-w-0 w-full sm:max-w-sm lg:max-w-md">
                    <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="search"
                      placeholder="Search tenant, email, plan…"
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      className="h-9 w-full rounded-xl border border-[#dfeae7] bg-white py-2 pl-10 pr-4 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-primary-600"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="h-9 gap-1.5 px-3"
                    onClick={() => setShowFilters((current) => !current)}
                    aria-expanded={showFilters}
                    aria-controls="billing-filters"
                  >
                    <Filter className="h-4 w-4 shrink-0" />
                    <span>{showFilters ? "Hide" : "Filters"}</span>
                    {showFilters ? (
                      <ChevronUp className="h-3.5 w-3.5 shrink-0" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5 shrink-0" />
                    )}
                  </Button>
                </div>
                <div className="shrink-0 lg:ml-4">
                  <Pagination
                    compact
                    page={page}
                    pageCount={pageCount}
                    total={filteredTenants.length}
                    onPageChange={setPage}
                    pageSize={pageSize}
                    pageSizeOptions={LIST_PAGE_SIZE_OPTIONS}
                    onPageSizeChange={setPageSize}
                    itemLabel="tenants"
                  />
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {showFilters ? (
                <div
                  id="billing-filters"
                  className="flex flex-wrap items-center gap-5 border-b border-[#dfeae7] bg-[#f8faf9] px-4 py-4 sm:px-6"
                >
                  {(["all", ...PLAN_OPTIONS] as const).map((plan) => {
                    const active = planFilter === plan;
                    return (
                      <button
                        key={plan}
                        type="button"
                        onClick={() => setPlanFilter(plan)}
                        className={`text-xs font-bold tracking-wider ${
                          active
                            ? "text-neutral-900"
                            : "text-neutral-500 hover:text-neutral-800"
                        }`}
                      >
                        {plan === "all" ? "ALL" : plan.toUpperCase()}
                      </button>
                    );
                  })}
                </div>
              ) : null}

              <div className="space-y-3 p-3 md:hidden">
                {visibleTenants.map((tenant) => (
                  <div
                    key={tenant.orgId}
                    className="rounded-xl border border-[#dfeae7] bg-white p-3 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-neutral-900">{tenant.name}</p>
                        <p className="mt-0.5 truncate text-sm text-neutral-500">
                          {tenant.billingEmail || "No billing email"}
                        </p>
                      </div>
                      <TableIconLink
                        href={organizationDetail(tenant.orgId)}
                        label="View organization"
                      >
                        <Eye className="h-4 w-4" />
                      </TableIconLink>
                    </div>
                    <dl className="mt-3 grid grid-cols-1 gap-1.5 text-sm">
                      <div className="flex justify-between gap-3">
                        <dt className="text-neutral-500">Status</dt>
                        <dd>
                          <TableStatusBadge className={orgStatusBadgeClass(tenant.status)}>
                            {orgStatusLabel(tenant.status)}
                          </TableStatusBadge>
                        </dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt className="text-neutral-500">Usage</dt>
                        <dd className="text-right text-neutral-800">
                          {tenant.memberCount} seats · {tenant.donationCount} donations
                        </dd>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <dt className="text-neutral-500">Plan</dt>
                        <dd>
                          <select
                            value={tenant.plan}
                            disabled={savingOrgId === tenant.orgId}
                            onChange={(event) =>
                              void changePlan(
                                tenant.orgId,
                                event.target.value as PlatformBillingPlan,
                              )
                            }
                            className="h-9 rounded-lg border border-neutral-200 bg-white px-2.5 text-sm font-medium text-neutral-700 outline-none focus:border-primary-600"
                          >
                            {PLAN_OPTIONS.map((plan) => (
                              <option key={plan} value={plan}>
                                {plan}
                              </option>
                            ))}
                          </select>
                        </dd>
                      </div>
                    </dl>
                  </div>
                ))}
              </div>

              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[960px] text-left text-sm">
                  <thead className={tableHeadClass}>
                    <tr>
                      {["Organization", "Status", "Usage", "Plan", "Actions"].map((heading) => (
                        <th key={heading} className="px-4 py-3 font-semibold">
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {visibleTenants.map((tenant) => (
                      <tr key={tenant.orgId} className={tableRowClass}>
                        <td className="px-4 py-3">
                          <p className="font-medium text-neutral-900">{tenant.name}</p>
                          <p className="text-neutral-500">
                            {tenant.billingEmail || "No billing email"}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <TableStatusBadge className={orgStatusBadgeClass(tenant.status)}>
                            {orgStatusLabel(tenant.status)}
                          </TableStatusBadge>
                        </td>
                        <td className="px-4 py-3 text-neutral-700">
                          {tenant.memberCount} seats · {tenant.donationCount} donations ·{" "}
                          {tenant.beneficiaryCount} beneficiaries
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={tenant.plan}
                            disabled={savingOrgId === tenant.orgId}
                            onChange={(event) =>
                              void changePlan(
                                tenant.orgId,
                                event.target.value as PlatformBillingPlan,
                              )
                            }
                            className="h-9 rounded-lg border border-neutral-200 bg-white px-2.5 text-sm font-medium text-neutral-700 outline-none focus:border-primary-600"
                          >
                            {PLAN_OPTIONS.map((plan) => (
                              <option key={plan} value={plan}>
                                {plan}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <TableIconLink
                              href={organizationDetail(tenant.orgId)}
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

              {visibleTenants.length === 0 ? (
                <p className="p-6 text-sm text-neutral-500">
                  No tenants match the current search or filters.
                </p>
              ) : null}
            </CardContent>
          </Card>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {data.upgradeTriggers.map((trigger) => (
              <Card key={trigger.id}>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-base">{trigger.label}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
                  <p className="text-sm text-neutral-600">{trigger.action}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </AppShell>
  );
}

function MetricCard({
  title,
  value,
  hint,
}: {
  title: string;
  value: number;
  hint: string;
}) {
  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
        <p className="text-3xl font-semibold text-neutral-900">{value}</p>
        <p className="text-sm text-neutral-500">{hint}</p>
      </CardContent>
    </Card>
  );
}
