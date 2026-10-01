"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import type { OrgType } from "@ngocore/types";
import { PlatformShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
      router.push("/platform/organizations");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to create organization.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PlatformShell title="Create organization" description="Onboard a new NGO tenant.">
      <Card className="max-w-xl border-zinc-800 bg-zinc-900 text-zinc-100">
        <CardHeader>
          <CardTitle className="text-base">Organization details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="mb-1 block text-sm font-medium">
                Organization name
              </label>
              <Input
                id="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border-zinc-700 bg-zinc-950 text-zinc-100"
              />
            </div>
            <div>
              <label htmlFor="pan" className="mb-1 block text-sm font-medium">
                PAN
              </label>
              <Input
                id="pan"
                required
                value={pan}
                onChange={(e) => setPan(e.target.value)}
                className="border-zinc-700 bg-zinc-950 text-zinc-100"
              />
            </div>
            <div>
              <label htmlFor="orgType" className="mb-1 block text-sm font-medium">
                Organization type
              </label>
              <select
                id="orgType"
                value={orgType}
                onChange={(e) => setOrgType(e.target.value as OrgType)}
                className="flex h-10 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm"
              >
                {orgTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
              {loading ? "Creating…" : "Create organization"}
            </Button>
          </form>
          {message ? <p className="mt-4 text-sm text-amber-400">{message}</p> : null}
        </CardContent>
      </Card>
    </PlatformShell>
  );
}
