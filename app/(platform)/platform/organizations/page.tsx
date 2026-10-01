"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Organization } from "@ngocore/types";
import { PlatformShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createApiClient } from "@/lib/api";

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const api = createApiClient();

    api.organizations
      .list()
      .then((response) => setOrganizations(response.data))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PlatformShell title="Organizations" description="Onboard and manage NGO tenants.">
      <div className="mb-4 flex justify-end">
        <Link href="/platform/organizations/new">
          <Button className="bg-indigo-600 hover:bg-indigo-700">Create organization</Button>
        </Link>
      </div>

      <Card className="border-zinc-800 bg-zinc-900 text-zinc-100">
        <CardHeader>
          <CardTitle className="text-base">All organizations</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? <p className="text-sm text-zinc-400">Loading…</p> : null}
          {error ? (
            <p className="text-sm text-amber-400">
              API unavailable ({error}). Backend OpenAPI not connected yet.
            </p>
          ) : null}
          {!loading && !error && organizations.length === 0 ? (
            <p className="text-sm text-zinc-400">No organizations onboarded yet.</p>
          ) : null}
          <ul className="divide-y divide-zinc-800">
            {organizations.map((org) => (
              <li key={org.id} className="py-3 text-sm">
                <p className="font-medium">{org.name}</p>
                <p className="text-zinc-400">
                  PAN: {org.pan} · {org.orgType}
                </p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </PlatformShell>
  );
}
