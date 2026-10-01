"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Eye, Search } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DEFAULT_LIST_PAGE_SIZE,
  LIST_PAGE_SIZE_OPTIONS,
  TableIconLink,
  tableHeadClass,
  tableRowClass,
} from "@/components/ui/list-table";
import { Pagination } from "@/components/ui/pagination";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { toast } from "@/components/ui/toaster";
import { organizationDetail } from "@/constants/routes";
import { createAuthedApi } from "@/lib/api";
import type { PlatformAuditLog } from "@/lib/api/platform";

export default function AuditLogPage() {
  const [entries, setEntries] = useState<PlatformAuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_LIST_PAGE_SIZE);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const response = await createAuthedApi().platform.listAuditLogs({
        search: debouncedSearch || undefined,
        page,
        pageSize,
      });
      setEntries(response.data ?? []);
      setTotal(response.total ?? 0);
      setPageCount(response.pageCount ?? 1);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load audit logs.");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, page, pageSize]);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => setPage(1), [debouncedSearch, pageSize]);

  return (
    <AppShell
      title="Audit log"
      description="Append-only trail of platform and tenant-sensitive mutations."
    >
      <Card>
        <CardHeader className="gap-4 space-y-0 p-4 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <CardTitle className="text-base font-semibold text-neutral-900">
                All events
              </CardTitle>
              <p className="mt-1 text-sm text-neutral-500">
                {total} event{total === 1 ? "" : "s"}
              </p>
            </div>
            <Button variant="secondary" size="sm" onClick={() => void reload()}>
              Refresh
            </Button>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative min-w-0 w-full sm:max-w-sm lg:max-w-md">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search action, org, or actor email…"
                className="h-9 w-full rounded-xl border border-[#dfeae7] bg-white py-2 pl-10 pr-4 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-primary-600"
              />
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
                itemLabel="events"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? <TableSkeleton columns={5} rows={8} /> : null}

          {!loading ? (
            <>
              <div className="space-y-3 p-3 md:hidden">
                {entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="rounded-xl border border-[#dfeae7] bg-white p-3 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-neutral-900">{entry.action}</p>
                        <p className="mt-0.5 text-sm text-neutral-500">
                          {new Date(entry.createdAt).toLocaleString()}
                        </p>
                      </div>
                      {entry.orgId ? (
                        <TableIconLink
                          href={organizationDetail(entry.orgId)}
                          label="View organization"
                        >
                          <Eye className="h-4 w-4" />
                        </TableIconLink>
                      ) : null}
                    </div>
                    <dl className="mt-3 grid grid-cols-1 gap-1.5 text-sm">
                      <div className="flex justify-between gap-3">
                        <dt className="text-neutral-500">Organization</dt>
                        <dd className="truncate text-right text-neutral-800">
                          {entry.orgName || "Platform"}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt className="text-neutral-500">Actor</dt>
                        <dd className="truncate text-right text-neutral-800">
                          {entry.actorEmail || entry.actorName || "—"}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt className="text-neutral-500">Entity</dt>
                        <dd className="text-right text-neutral-800">
                          {entry.entityType}
                          {entry.entityId ? ` · ${String(entry.entityId).slice(0, 8)}` : ""}
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
                      {["When", "Action", "Organization", "Actor", "Entity", "Actions"].map(
                        (heading) => (
                          <th key={heading} className="px-4 py-3 font-semibold">
                            {heading}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {entries.map((entry) => (
                      <tr key={entry.id} className={tableRowClass}>
                        <td className="whitespace-nowrap px-4 py-3 text-neutral-600">
                          {new Date(entry.createdAt).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 font-medium text-neutral-900">{entry.action}</td>
                        <td className="px-4 py-3">
                          {entry.orgId ? (
                            <Link
                              href={organizationDetail(entry.orgId)}
                              className="font-medium text-primary-700 hover:underline"
                            >
                              {entry.orgName || entry.orgId.slice(0, 8)}
                            </Link>
                          ) : (
                            <span className="text-neutral-500">Platform</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-neutral-700">
                          {entry.actorEmail || entry.actorName || "—"}
                        </td>
                        <td className="px-4 py-3 text-neutral-600">
                          {entry.entityType}
                          {entry.entityId ? ` · ${String(entry.entityId).slice(0, 8)}` : ""}
                        </td>
                        <td className="px-4 py-3">
                          {entry.orgId ? (
                            <div className="flex items-center gap-1">
                              <TableIconLink
                                href={organizationDetail(entry.orgId)}
                                label="View organization"
                              >
                                <Eye className="h-4 w-4" />
                              </TableIconLink>
                            </div>
                          ) : (
                            <span className="text-neutral-400">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {entries.length === 0 ? (
                <p className="p-6 text-sm text-neutral-500">No audit events found.</p>
              ) : null}
            </>
          ) : null}
        </CardContent>
      </Card>
    </AppShell>
  );
}
