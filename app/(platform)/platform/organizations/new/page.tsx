"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import type { OrgType } from "@ngocore/types";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/constants/routes";
import { createApiClient } from "@/lib/api";

const orgTypes: OrgType[] = ["trust", "society", "section8", "other"];

export default function NewOrganizationPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [pan, setPan] = useState("");
  const [orgType, setOrgType] = useState<OrgType>("trust");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const api = createApiClient();
      await api.organizations.create({ name, pan, orgType });
      router.push(ROUTES.ORGANIZATIONS);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to create organization.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell title="Create organization" description="Onboard a new NGO tenant.">
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle className="text-base">Organization details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="name"
              label="Organization name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              id="pan"
              label="PAN"
              required
              value={pan}
              onChange={(e) => setPan(e.target.value)}
            />
            <div>
              <label htmlFor="orgType" className="mb-2 block text-sm font-medium text-neutral-700">
                Organization type
              </label>
              <select
                id="orgType"
                value={orgType}
                onChange={(e) => setOrgType(e.target.value as OrgType)}
                className="h-11 w-full rounded-xl border border-[#dfeae7] bg-white px-4 text-base text-neutral-900 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-600"
              >
                {orgTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit" isLoading={loading}>
              Create organization
            </Button>
          </form>
          {message ? <p className="mt-4 text-sm text-amber-700">{message}</p> : null}
        </CardContent>
      </Card>
    </AppShell>
  );
}
