"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Eye,
  Filter,
  PauseCircle,
  PlayCircle,
  Plus,
  Search,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import {
  DEFAULT_LIST_PAGE_SIZE,
  LIST_PAGE_SIZE_OPTIONS,
  TableIconButton,
  TableIconLink,
  TableStatusBadge,
  tableHeadClass,
  tableRowClass,
} from "@/components/ui/list-table";
import { Pagination } from "@/components/ui/pagination";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { toast } from "@/components/ui/toaster";
import { ROUTES, organizationDetail } from "@/constants/routes";
import { createAuthedApi } from "@/lib/api";
import type { PlatformOrgStatus, PlatformOrganization } from "@/lib/api/platform";
import {
  ORG_STATUS_FILTERS,
  orgStatusBadgeClass,
  orgStatusLabel,
  orgTypeLabel,
} from "@/lib/org-labels";

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<PlatformOrganization[]>([]);
  const [total, setTotal] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<(typeof ORG_STATUS_FILTERS)[number]>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_LIST_PAGE_SIZE);
  const [pendingStatus, setPendingStatus] = useState<{
    org: PlatformOrganization;
    status: PlatformOrgStatus;
  } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const api = createAuthedApi();
      const response = await api.platform.listOrganizations({
        search: debouncedSearch || undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
        page,
        pageSize,
      });
      setOrganizations(response.data ?? []);
      setTotal(response.total ?? 0);
      setPageCount(response.pageCount ?? 1);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load organizations.");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, statusFilter, page, pageSize]);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => setPage(1), [debouncedSearch, statusFilter, pageSize]);

  async function applyStatusChange() {
    if (!pendingStatus) return;
    setSaving(true);
    try {
      const api = createAuthedApi();
      await api.platform.updateStatus(pendingStatus.org.id, pendingStatus.status);
      toast.success(
        pendingStatus.status === "suspended"
          ? `${pendingStatus.org.name} suspended.`
          : `${pendingStatus.org.name} set to ${pendingStatus.status}.`,
      );
      setPendingStatus(null);
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update status.");
    } finally {
      setSaving(false);
    }
  }

  function statusAction(org: PlatformOrganization) {
    if (org.status === "suspended") {
      return {
        label: "Reinstate",
        icon: PlayCircle,
        tone: "primary" as const,
        next: "active" as PlatformOrgStatus,
      };
    }
    if (org.status === "draft") {
      return {
        label: "Activate",
        icon: PlayCircle,
        tone: "primary" as const,
        next: "active" as PlatformOrgStatus,
      };
    }
    return {
      label: "Suspend",
      icon: PauseCircle,
      tone: "danger" as const,
      next: "suspended" as PlatformOrgStatus,
    };
  }

  return (
    <AppShell title="Organizations" description="Onboard, suspend, and reinstate NGO tenants.">
      <Card>
        <CardHeader className="gap-4 space-y-0 p-4 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <CardTitle className="text-base font-semibold text-neutral-900">
                All organizations
              </CardTitle>
              <p className="mt-1 text-sm text-neutral-500">
                {total} organization{total === 1 ? "" : "s"}
                {statusFilter !== "all" ? ` · ${orgStatusLabel(statusFilter)}` : ""}
              </p>
            </div>
            <div className="flex w-full shrink-0 items-center gap-2 sm:w-auto">
              <Link href={ROUTES.ORGANIZATION_NEW} className="flex-1 sm:flex-none">
                <Button size="sm" className="w-full">
                  <Plus className="h-4 w-4" />
                  Onboard organization
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative min-w-0 w-full sm:max-w-sm lg:max-w-md">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <input
                  type="search"
                  placeholder="Search by name or PAN…"
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
                aria-controls="org-filters"
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
                total={total}
                onPageChange={setPage}
                pageSize={pageSize}
                pageSizeOptions={LIST_PAGE_SIZE_OPTIONS}
                onPageSizeChange={setPageSize}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {showFilters ? (
            <div
              id="org-filters"
              className="flex flex-col gap-3 border-b border-[#dfeae7] bg-[#f8faf9] px-4 py-4 sm:px-6"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Status
              </p>
              <div className="flex flex-wrap items-center gap-5 overflow-x-auto">
                {ORG_STATUS_FILTERS.map((status) => {
                  const active = statusFilter === status;
                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setStatusFilter(status)}
                      className={`flex shrink-0 items-center gap-2 text-xs font-bold tracking-wider transition-all duration-150 ${
                        active
                          ? "text-neutral-900"
                          : "text-neutral-500 hover:text-neutral-800"
                      }`}
                    >
                      <span>{status === "all" ? "ALL" : orgStatusLabel(status).toUpperCase()}</span>
                      {active ? (
                        <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#2e6885] px-1.5 text-[11px] font-semibold leading-none text-white">
                          ●
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
              {statusFilter !== "all" ? (
                <div>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setStatusFilter("all")}
                  >
                    Clear filters
                  </Button>
                </div>
              ) : null}
            </div>
          ) : null}

          {loading ? <TableSkeleton columns={6} rows={8} /> : null}

          {!loading ? (
            <>
              <div className="space-y-3 p-3 md:hidden">
                {organizations.map((org) => {
                  const action = statusAction(org);
                  const ActionIcon = action.icon;
                  return (
                    <div
                      key={org.id}
                      className="rounded-xl border border-[#dfeae7] bg-white p-3 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-neutral-900">{org.name}</p>
                          <p className="mt-0.5 truncate text-sm text-neutral-500">
                            {orgTypeLabel(org.orgType)} · {org.pan || "No PAN"}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          <TableIconLink
                            href={organizationDetail(org.id)}
                            label="View organization"
                          >
                            <Eye className="h-4 w-4" />
                          </TableIconLink>
                          <TableIconButton
                            label={action.label}
                            tone={action.tone}
                            onClick={() => setPendingStatus({ org, status: action.next })}
                          >
                            <ActionIcon className="h-4 w-4" />
                          </TableIconButton>
                        </div>
                      </div>
                      <dl className="mt-3 grid grid-cols-1 gap-1.5 text-sm">
                        <div className="flex justify-between gap-3">
                          <dt className="text-neutral-500">Owner</dt>
                          <dd className="truncate text-right text-neutral-800">
                            {org.ownerEmail || "—"}
                          </dd>
                        </div>
                        <div className="flex justify-between gap-3">
                          <dt className="text-neutral-500">Members</dt>
                          <dd className="text-right text-neutral-800">{org.memberCount ?? 0}</dd>
                        </div>
                        <div className="flex justify-between gap-3">
                          <dt className="text-neutral-500">Status</dt>
                          <dd className="text-right">
                            <TableStatusBadge className={orgStatusBadgeClass(org.status)}>
                              {orgStatusLabel(org.status)}
                            </TableStatusBadge>
                          </dd>
                        </div>
                      </dl>
                    </div>
                  );
                })}
              </div>

              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[960px] text-left text-sm">
                  <thead className={tableHeadClass}>
                    <tr>
                      {["Organization", "Type", "Owner", "Members", "Status", "Actions"].map(
                        (heading) => (
                          <th key={heading} className="px-4 py-3 font-semibold">
                            {heading}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {organizations.map((org) => {
                      const action = statusAction(org);
                      const ActionIcon = action.icon;
                      return (
                        <tr key={org.id} className={tableRowClass}>
                          <td className="px-4 py-3">
                            <Link
                              href={organizationDetail(org.id)}
                              className="font-medium text-neutral-900 hover:text-primary-700"
                            >
                              {org.name}
                            </Link>
                            <p className="text-neutral-500">{org.pan || "No PAN"}</p>
                          </td>
                          <td className="px-4 py-3 text-neutral-700">
                            {orgTypeLabel(org.orgType)}
                          </td>
                          <td className="px-4 py-3 text-neutral-700">
                            {org.ownerEmail || "—"}
                          </td>
                          <td className="px-4 py-3 text-neutral-700">{org.memberCount ?? 0}</td>
                          <td className="px-4 py-3">
                            <TableStatusBadge className={orgStatusBadgeClass(org.status)}>
                              {orgStatusLabel(org.status)}
                            </TableStatusBadge>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <TableIconLink
                                href={organizationDetail(org.id)}
                                label="View organization"
                              >
                                <Eye className="h-4 w-4" />
                              </TableIconLink>
                              <TableIconButton
                                label={action.label}
                                tone={action.tone}
                                onClick={() =>
                                  setPendingStatus({ org, status: action.next })
                                }
                              >
                                <ActionIcon className="h-4 w-4" />
                              </TableIconButton>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {organizations.length === 0 ? (
                <p className="p-6 text-sm text-neutral-500">
                  No organizations match the current search or filters.
                </p>
              ) : null}
            </>
          ) : null}
        </CardContent>
      </Card>

      <ConfirmationDialog
        open={Boolean(pendingStatus)}
        title={
          pendingStatus?.status === "suspended"
            ? "Suspend organization?"
            : pendingStatus?.status === "active" && pendingStatus.org.status === "suspended"
              ? "Reinstate organization?"
              : "Activate organization?"
        }
        message={
          pendingStatus?.status === "suspended"
            ? `${pendingStatus.org.name} will be suspended. Staff access should be treated as frozen until reinstated.`
            : `Set ${pendingStatus?.org.name} to ${pendingStatus?.status}?`
        }
        confirmLabel={pendingStatus?.status === "suspended" ? "Suspend" : "Confirm"}
        confirmVariant={pendingStatus?.status === "suspended" ? "danger" : "primary"}
        onCancel={() => (!saving ? setPendingStatus(null) : undefined)}
        onConfirm={() => void applyStatusChange()}
      />
    </AppShell>
  );
}
