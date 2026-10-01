"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Download, Search, Shield } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toaster";
import { organizationDetail } from "@/constants/routes";
import { createAuthedApi } from "@/lib/api";
import type { PlatformSupportLookup } from "@/lib/api/platform";
import { orgStatusBadgeClass, orgStatusLabel } from "@/lib/org-labels";

export default function SupportPage() {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [dossier, setDossier] = useState<PlatformSupportLookup | null>(null);
  const [reason, setReason] = useState("");
  const [ticketRef, setTicketRef] = useState("");
  const [acting, setActing] = useState(false);

  async function lookup(event?: FormEvent) {
    event?.preventDefault();
    if (!search.trim()) {
      toast.error("Enter an organization name, PAN, or ID.");
      return;
    }
    setLoading(true);
    try {
      const result = await createAuthedApi().platform.supportLookup({
        search: search.trim(),
      });
      setDossier(result);
    } catch (err) {
      setDossier(null);
      toast.error(err instanceof Error ? err.message : "Lookup failed.");
    } finally {
      setLoading(false);
    }
  }

  async function requestAccess() {
    if (!dossier) return;
    if (reason.trim().length < 8) {
      toast.error("Provide a reason (at least 8 characters).");
      return;
    }
    setActing(true);
    try {
      await createAuthedApi().platform.requestSupportAccess(dossier.organization.id, {
        reason: reason.trim(),
        ticketRef: ticketRef.trim() || undefined,
      });
      toast.success("Support access request audited.");
      setReason("");
      setTicketRef("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Request failed.");
    } finally {
      setActing(false);
    }
  }

  async function downloadExport() {
    if (!dossier) return;
    setActing(true);
    try {
      const payload = await createAuthedApi().platform.exportAssist(dossier.organization.id, {
        format: "json",
        reason: reason.trim() || "Support export assist",
      });
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `ngocore-export-assist-${dossier.organization.id}.json`;
      anchor.click();
      URL.revokeObjectURL(url);
      toast.success("Export assist package downloaded (audited).");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Export assist failed.");
    } finally {
      setActing(false);
    }
  }

  return (
    <AppShell
      title="Support tools"
      description="Audited tenant lookup, access requests, and data export assist."
    >
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Lookup organization</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={lookup} className="flex flex-col gap-3 sm:flex-row">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, PAN, or org UUID…"
            />
            <Button type="submit" isLoading={loading}>
              <Search className="h-4 w-4" />
              Lookup
            </Button>
          </form>
          <p className="mt-3 text-sm text-neutral-500">
            Live session impersonation is not enabled. All support actions write to the audit log.
          </p>
        </CardContent>
      </Card>

      {!dossier ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-neutral-500">
            Search for a tenant to open the support dossier.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-start justify-between gap-3">
              <div>
                <CardTitle className="text-base">{dossier.organization.name}</CardTitle>
                <p className="mt-1 text-sm text-neutral-500">
                  {dossier.planLabel} · {dossier.organization.ownerEmail || "No owner"} ·{" "}
                  {dossier.organization.pan || "No PAN"}
                </p>
              </div>
              <span
                className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${orgStatusBadgeClass(dossier.organization.status)}`}
              >
                {orgStatusLabel(dossier.organization.status)}
              </span>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-4">
                <Metric label="Members" value={dossier.organization.memberCount ?? 0} />
                <Metric label="Donations" value={dossier.usage.donationCount} />
                <Metric label="Beneficiaries" value={dossier.usage.beneficiaryCount} />
                <Metric label="Receipts" value={dossier.usage.receiptCount} />
              </div>

              {dossier.organization.complianceIssues.length > 0 ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  {dossier.organization.complianceIssues.join(" · ")}
                </div>
              ) : (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                  No compliance gaps flagged.
                </div>
              )}

              <div>
                <p className="mb-2 text-sm font-semibold text-neutral-800">Team</p>
                <ul className="divide-y divide-[#dfeae7] rounded-xl border border-[#dfeae7]">
                  {dossier.organization.members.map((member) => (
                    <li
                      key={member.id}
                      className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm"
                    >
                      <span className="truncate text-neutral-800">
                        {member.fullName || member.email}
                      </span>
                      <span className="shrink-0 text-neutral-500">{member.role}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="mb-2 text-sm font-semibold text-neutral-800">Recent audits</p>
                {dossier.recentAudits.length === 0 ? (
                  <p className="text-sm text-neutral-500">No audit events yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {dossier.recentAudits.map((entry) => (
                      <li
                        key={entry.id}
                        className="rounded-xl border border-[#dfeae7] px-4 py-2.5 text-sm"
                      >
                        <p className="font-medium text-neutral-900">{entry.action}</p>
                        <p className="text-xs text-neutral-500">
                          {entry.actorEmail || "system"} ·{" "}
                          {new Date(entry.createdAt).toLocaleString()}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <Link
                href={organizationDetail(dossier.organization.id)}
                className="inline-flex text-sm font-medium text-primary-700 hover:underline"
              >
                Open full organization page
              </Link>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Audited access request</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input
                  label="Ticket / case ref"
                  value={ticketRef}
                  onChange={(event) => setTicketRef(event.target.value)}
                  placeholder="SUP-1042"
                />
                <div>
                  <label className="mb-2 block text-sm font-medium text-neutral-700">
                    Reason
                  </label>
                  <textarea
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                    rows={4}
                    className="w-full rounded-xl border border-[#dfeae7] bg-white px-4 py-3 text-sm text-neutral-900 shadow-sm outline-none focus:border-transparent focus:ring-2 focus:ring-primary-600"
                    placeholder="Why support needs tenant access…"
                  />
                </div>
                <Button
                  className="w-full"
                  variant="secondary"
                  isLoading={acting}
                  onClick={() => void requestAccess()}
                >
                  <Shield className="h-4 w-4" />
                  Log access request
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Data export assist</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-neutral-500">
                  Downloads an audited JSON package with org profile, members, usage, and
                  compliance signals — no live impersonation session.
                </p>
                <Button
                  className="w-full"
                  isLoading={acting}
                  onClick={() => void downloadExport()}
                >
                  <Download className="h-4 w-4" />
                  Download assist package
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-[#dfeae7] bg-[#f8faf9] px-3 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">{label}</p>
      <p className="mt-1 text-xl font-semibold text-neutral-900">{value}</p>
    </div>
  );
}
