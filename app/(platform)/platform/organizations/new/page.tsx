"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { OrgType } from "@ngocore/types";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toaster";
import { ROUTES, organizationDetail } from "@/constants/routes";
import { createAuthedApi } from "@/lib/api";
import { orgTypeLabel } from "@/lib/org-labels";

const orgTypes: OrgType[] = ["trust", "society", "section8", "other"];
const STEPS = ["Organization", "Compliance", "Owner", "Review"] as const;

export default function NewOrganizationPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [orgType, setOrgType] = useState<OrgType>("trust");
  const [status, setStatus] = useState<"draft" | "active">("draft");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [registrationNo, setRegistrationNo] = useState("");

  const [pan, setPan] = useState("");
  const [eightyGRegistrationNo, setEightyG] = useState("");
  const [fcraRegistrationNo, setFcra] = useState("");
  const [receiptPrefix, setReceiptPrefix] = useState("");

  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerFullName, setOwnerFullName] = useState("");

  const canNext = useMemo(() => {
    if (step === 0) return name.trim().length >= 2;
    if (step === 2) return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ownerEmail.trim());
    return true;
  }, [step, name, ownerEmail]);

  async function handleSubmit(event?: FormEvent) {
    event?.preventDefault();
    if (!canNext && step < 3) return;
    if (step < 3) {
      setStep((value) => value + 1);
      return;
    }

    setLoading(true);
    try {
      const api = createAuthedApi();
      const org = await api.platform.createOrganization({
        name: name.trim(),
        orgType,
        status,
        address: address.trim() || undefined,
        phone: phone.trim() || undefined,
        contactEmail: contactEmail.trim() || undefined,
        registrationNo: registrationNo.trim() || undefined,
        pan: pan.trim() || undefined,
        eightyGRegistrationNo: eightyGRegistrationNo.trim() || undefined,
        fcraRegistrationNo: fcraRegistrationNo.trim() || undefined,
        receiptPrefix: receiptPrefix.trim() || undefined,
        ownerEmail: ownerEmail.trim().toLowerCase(),
        ownerFullName: ownerFullName.trim() || undefined,
      });
      toast.success("Organization onboarded.", "Owner assigned or invitation created.");
      router.push(organizationDetail(org.id));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create organization.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell
      title="Onboard organization"
      description="Create a tenant, set compliance fields, and assign an owner."
    >
      <div className="mb-4">
        <Link href={ROUTES.ORGANIZATIONS} className="text-sm text-primary-700 hover:underline">
          ← Back to organizations
        </Link>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {STEPS.map((label, index) => (
          <div
            key={label}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              index === step
                ? "bg-[#0f2d2a] text-white"
                : index < step
                  ? "bg-primary-100 text-primary-800"
                  : "bg-white text-neutral-500 ring-1 ring-[#dfeae7]"
            }`}
          >
            {index + 1}. {label}
          </div>
        ))}
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-base">{STEPS[step]}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
            {step === 0 ? (
              <>
                <Input
                  id="name"
                  label="Organization name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Example Education Trust"
                />
                <label className="block text-sm font-medium text-neutral-700">
                  Organization type
                  <select
                    value={orgType}
                    onChange={(e) => setOrgType(e.target.value as OrgType)}
                    className="mt-1 h-11 w-full rounded-xl border border-[#dfeae7] bg-white px-4 text-sm"
                  >
                    {orgTypes.map((type) => (
                      <option key={type} value={type}>
                        {orgTypeLabel(type)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm font-medium text-neutral-700">
                  Initial status
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as "draft" | "active")}
                    className="mt-1 h-11 w-full rounded-xl border border-[#dfeae7] bg-white px-4 text-sm"
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                  </select>
                </label>
                <Input
                  id="address"
                  label="Address (optional)"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    id="phone"
                    label="Phone (optional)"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  <Input
                    id="contactEmail"
                    type="email"
                    label="Org contact email (optional)"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                  />
                </div>
                <Input
                  id="registrationNo"
                  label="Registration number (optional)"
                  value={registrationNo}
                  onChange={(e) => setRegistrationNo(e.target.value)}
                />
              </>
            ) : null}

            {step === 1 ? (
              <>
                <Input
                  id="pan"
                  label="PAN"
                  value={pan}
                  onChange={(e) => setPan(e.target.value.toUpperCase())}
                  placeholder="AAAAA9999A"
                />
                <Input
                  id="eightyG"
                  label="80G registration"
                  value={eightyGRegistrationNo}
                  onChange={(e) => setEightyG(e.target.value)}
                />
                <Input
                  id="fcra"
                  label="FCRA registration"
                  value={fcraRegistrationNo}
                  onChange={(e) => setFcra(e.target.value)}
                />
                <Input
                  id="receiptPrefix"
                  label="Receipt prefix"
                  value={receiptPrefix}
                  onChange={(e) => setReceiptPrefix(e.target.value.toUpperCase())}
                  placeholder="Auto from name if empty"
                />
              </>
            ) : null}

            {step === 2 ? (
              <>
                <Input
                  id="ownerEmail"
                  type="email"
                  label="Owner email"
                  required
                  value={ownerEmail}
                  onChange={(e) => setOwnerEmail(e.target.value)}
                  placeholder="owner@ngo.org"
                />
                <Input
                  id="ownerFullName"
                  label="Owner full name (optional)"
                  value={ownerFullName}
                  onChange={(e) => setOwnerFullName(e.target.value)}
                />
                <p className="text-sm text-neutral-500">
                  If this email already has an NGOCore account, they become owner immediately.
                  Otherwise an owner invitation is created for the staff app.
                </p>
              </>
            ) : null}

            {step === 3 ? (
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between gap-4 border-b border-[#eef3f1] py-2">
                  <dt className="text-neutral-500">Name</dt>
                  <dd className="font-medium text-neutral-900">{name}</dd>
                </div>
                <div className="flex justify-between gap-4 border-b border-[#eef3f1] py-2">
                  <dt className="text-neutral-500">Type / status</dt>
                  <dd className="font-medium text-neutral-900">
                    {orgTypeLabel(orgType)} · {status}
                  </dd>
                </div>
                <div className="flex justify-between gap-4 border-b border-[#eef3f1] py-2">
                  <dt className="text-neutral-500">PAN / 80G / FCRA</dt>
                  <dd className="text-right font-medium text-neutral-900">
                    {pan || "—"} · {eightyGRegistrationNo || "—"} · {fcraRegistrationNo || "—"}
                  </dd>
                </div>
                <div className="flex justify-between gap-4 py-2">
                  <dt className="text-neutral-500">Owner</dt>
                  <dd className="text-right font-medium text-neutral-900">
                    {ownerFullName ? `${ownerFullName} · ` : ""}
                    {ownerEmail}
                  </dd>
                </div>
              </dl>
            ) : null}

            <div className="flex flex-wrap justify-between gap-2 pt-2">
              <Button
                type="button"
                variant="secondary"
                disabled={step === 0 || loading}
                onClick={() => setStep((value) => Math.max(0, value - 1))}
              >
                Back
              </Button>
              <Button type="submit" disabled={!canNext || loading} isLoading={loading}>
                {step === 3 ? "Create organization" : "Continue"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </AppShell>
  );
}
