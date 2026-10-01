"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { OrgType } from "@ngocore/types";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Input } from "@/components/ui/input";
import { ListSkeleton } from "@/components/ui/table-skeleton";
import { toast } from "@/components/ui/toaster";
import { ROUTES } from "@/constants/routes";
import { createAuthedApi } from "@/lib/api";
import type { PlatformOrgDetail, PlatformOrgStatus } from "@/lib/api/platform";
import { orgStatusBadgeClass, orgStatusLabel, orgTypeLabel } from "@/lib/org-labels";

const ORG_TYPES: OrgType[] = ["trust", "society", "section8", "other"];
type TabId = "overview" | "compliance" | "team" | "status";

export default function OrganizationDetailPage() {
  const params = useParams<{ orgId: string }>();
  const orgId = params.orgId;

  const [org, setOrg] = useState<PlatformOrgDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabId>("overview");
  const [saving, setSaving] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<PlatformOrgStatus | null>(null);

  const [name, setName] = useState("");
  const [orgType, setOrgType] = useState<OrgType>("trust");
  const [pan, setPan] = useState("");
  const [eightyG, setEightyG] = useState("");
  const [fcra, setFcra] = useState("");
  const [receiptPrefix, setReceiptPrefix] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [registrationNo, setRegistrationNo] = useState("");

  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerFullName, setOwnerFullName] = useState("");

  const hydrateForm = useCallback((detail: PlatformOrgDetail) => {
    setName(detail.name ?? "");
    setOrgType((detail.orgType as OrgType) || "trust");
    setPan(detail.pan ?? "");
    setEightyG(detail.eightyGRegistrationNo ?? "");
    setFcra(detail.fcraRegistrationNo ?? "");
    setReceiptPrefix(detail.receiptPrefix ?? "");
    setAddress(detail.address ?? "");
    setPhone(detail.phone ?? "");
    setContactEmail(detail.email ?? "");
    setRegistrationNo(detail.registrationNo ?? "");
  }, []);

  const reload = useCallback(async () => {
    const api = createAuthedApi();
    const detail = await api.platform.getOrganization(orgId);
    setOrg(detail);
    hydrateForm(detail);
  }, [orgId, hydrateForm]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    reload()
      .catch((err) => {
        if (!cancelled) {
          toast.error(err instanceof Error ? err.message : "Failed to load organization.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [reload]);

  async function saveProfile(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const api = createAuthedApi();
      await api.platform.updateOrganization(orgId, {
        name: name.trim(),
        orgType,
        pan: pan.trim(),
        eightyGRegistrationNo: eightyG.trim(),
        fcraRegistrationNo: fcra.trim(),
        receiptPrefix: receiptPrefix.trim() || undefined,
        address: address.trim(),
        phone: phone.trim(),
        contactEmail: contactEmail.trim() || undefined,
        registrationNo: registrationNo.trim(),
      });
      toast.success("Organization updated.");
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save organization.");
    } finally {
      setSaving(false);
    }
  }

  async function applyStatus() {
    if (!pendingStatus) return;
    setSaving(true);
    try {
      const api = createAuthedApi();
      await api.platform.updateStatus(orgId, pendingStatus);
      toast.success(`Status set to ${pendingStatus}.`);
      setPendingStatus(null);
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update status.");
    } finally {
      setSaving(false);
    }
  }

  async function inviteOwner(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const api = createAuthedApi();
      const result = await api.platform.inviteOwner(orgId, {
        email: ownerEmail.trim(),
        fullName: ownerFullName.trim() || undefined,
      });
      toast.success(
        result.assigned
          ? "Existing user assigned as owner."
          : "Owner invitation created.",
      );
      setOwnerEmail("");
      setOwnerFullName("");
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not invite owner.");
    } finally {
      setSaving(false);
    }
  }

  const tabs: Array<{ id: TabId; label: string }> = [
    { id: "overview", label: "Overview" },
    { id: "compliance", label: "Compliance" },
    { id: "team", label: "Team" },
    { id: "status", label: "Status" },
  ];

  return (
    <AppShell
      title={org?.name ?? "Organization"}
      description="Tenant profile, compliance, owner assignment, and lifecycle status."
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Link href={ROUTES.ORGANIZATIONS} className="text-sm text-primary-700 hover:underline">
          ← Back to organizations
        </Link>
        {org ? (
          <span
            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${orgStatusBadgeClass(org.status)}`}
          >
            {orgStatusLabel(org.status)}
          </span>
        ) : null}
      </div>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              tab === item.id
                ? "bg-[#0f2d2a] text-white"
                : "bg-white text-neutral-600 ring-1 ring-[#dfeae7]"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {loading || !org ? (
        <Card>
          <CardContent className="pt-6">
            <ListSkeleton rows={5} />
          </CardContent>
        </Card>
      ) : null}

      {!loading && org && tab === "overview" ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => void saveProfile(e)} className="space-y-4">
                <Input id="name" label="Name" required value={name} onChange={(e) => setName(e.target.value)} />
                <label className="block text-sm font-medium text-neutral-700">
                  Type
                  <select
                    value={orgType}
                    onChange={(e) => setOrgType(e.target.value as OrgType)}
                    className="mt-1 h-11 w-full rounded-xl border border-[#dfeae7] bg-white px-4 text-sm"
                  >
                    {ORG_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {orgTypeLabel(type)}
                      </option>
                    ))}
                  </select>
                </label>
                <Input id="address" label="Address" value={address} onChange={(e) => setAddress(e.target.value)} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input id="phone" label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  <Input
                    id="contactEmail"
                    type="email"
                    label="Contact email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                  />
                </div>
                <Input
                  id="registrationNo"
                  label="Registration number"
                  value={registrationNo}
                  onChange={(e) => setRegistrationNo(e.target.value)}
                />
                <Button type="submit" isLoading={saving}>
                  Save profile
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Snapshot</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between gap-3 border-b border-[#eef3f1] py-2">
                <span className="text-neutral-500">Owner</span>
                <span className="font-medium text-neutral-900">{org.ownerEmail || "Unassigned"}</span>
              </div>
              <div className="flex justify-between gap-3 border-b border-[#eef3f1] py-2">
                <span className="text-neutral-500">Members</span>
                <span className="font-medium text-neutral-900">{org.memberCount ?? 0}</span>
              </div>
              <div className="flex justify-between gap-3 border-b border-[#eef3f1] py-2">
                <span className="text-neutral-500">Created</span>
                <span className="font-medium text-neutral-900">
                  {new Date(org.createdAt).toLocaleDateString("en-IN")}
                </span>
              </div>
              <div>
                <p className="mb-2 text-neutral-500">Compliance issues</p>
                {org.complianceIssues.length === 0 ? (
                  <p className="font-medium text-emerald-700">No gaps detected</p>
                ) : (
                  <ul className="list-disc space-y-1 pl-5 text-amber-800">
                    {org.complianceIssues.map((issue) => (
                      <li key={issue}>{issue}</li>
                    ))}
                  </ul>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {!loading && org && tab === "compliance" ? (
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle className="text-base">Compliance fields</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => void saveProfile(e)} className="space-y-4">
              <Input
                id="pan"
                label="PAN"
                value={pan}
                onChange={(e) => setPan(e.target.value.toUpperCase())}
              />
              <Input
                id="eightyG"
                label="80G registration"
                value={eightyG}
                onChange={(e) => setEightyG(e.target.value)}
              />
              <Input
                id="fcra"
                label="FCRA registration"
                value={fcra}
                onChange={(e) => setFcra(e.target.value)}
              />
              <Input
                id="receiptPrefix"
                label="Receipt prefix"
                value={receiptPrefix}
                onChange={(e) => setReceiptPrefix(e.target.value.toUpperCase())}
              />
              <Button type="submit" isLoading={saving}>
                Save compliance
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : null}

      {!loading && org && tab === "team" ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Assign / invite owner</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => void inviteOwner(e)} className="space-y-4">
                <Input
                  id="ownerEmail"
                  type="email"
                  label="Owner email"
                  required
                  value={ownerEmail}
                  onChange={(e) => setOwnerEmail(e.target.value)}
                />
                <Input
                  id="ownerFullName"
                  label="Full name (optional)"
                  value={ownerFullName}
                  onChange={(e) => setOwnerFullName(e.target.value)}
                />
                <Button type="submit" isLoading={saving}>
                  Assign owner
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Members ({org.members.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {org.members.length === 0 ? (
                <p className="text-sm text-neutral-500">No members yet.</p>
              ) : (
                <ul className="divide-y divide-[#dfeae7]">
                  {org.members.map((member) => (
                    <li key={member.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-neutral-900">
                          {member.fullName || member.email}
                        </p>
                        <p className="truncate text-neutral-500">{member.email}</p>
                      </div>
                      <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-semibold">
                        {member.role}
                        {!member.isActive ? " · inactive" : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-4 border-t border-[#dfeae7] pt-4">
                <p className="mb-2 text-sm font-medium text-neutral-700">
                  Pending invitations ({org.invitations.length})
                </p>
                {org.invitations.length === 0 ? (
                  <p className="text-sm text-neutral-500">None</p>
                ) : (
                  <ul className="divide-y divide-[#dfeae7]">
                    {org.invitations.map((invite) => (
                      <li key={invite.id} className="py-2 text-sm">
                        <p className="font-medium text-neutral-900">{invite.email}</p>
                        <p className="text-neutral-500">
                          {invite.role} · {invite.status}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {!loading && org && tab === "status" ? (
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle className="text-base">Lifecycle status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-neutral-600">
              Current status:{" "}
              <span className="font-semibold text-neutral-900">{orgStatusLabel(org.status)}</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {(org.allowedStatusTransitions ?? []).map((status) => (
                <Button
                  key={status}
                  type="button"
                  variant={status === "suspended" ? "danger" : "secondary"}
                  disabled={saving}
                  onClick={() => setPendingStatus(status)}
                >
                  Mark {orgStatusLabel(status)}
                </Button>
              ))}
            </div>
            {(org.allowedStatusTransitions ?? []).length === 0 ? (
              <p className="text-sm text-neutral-500">No status transitions available.</p>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      <ConfirmationDialog
        open={Boolean(pendingStatus)}
        title={`Set status to ${pendingStatus}?`}
        message={`This updates ${org?.name ?? "the organization"} to ${pendingStatus}.`}
        confirmLabel="Confirm"
        confirmVariant={pendingStatus === "suspended" ? "danger" : "primary"}
        onCancel={() => (!saving ? setPendingStatus(null) : undefined)}
        onConfirm={() => void applyStatus()}
      />
    </AppShell>
  );
}
