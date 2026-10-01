"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Organization } from "@ngocore/types";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";
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
    <AppShell title="Organizations" description="Onboard and manage NGO tenants.">
      <div className="mb-4 flex justify-end">
        <Link href={ROUTES.ORGANIZATION_NEW}>
          <Button>Create organization</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All organizations</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? <p className="text-sm text-neutral-500">Loading…</p> : null}
          {error ? (
            <p className="text-sm text-amber-700">
              API unavailable ({error}). Backend OpenAPI not connected yet.
            </p>
          ) : null}
          {!loading && !error && organizations.length === 0 ? (
            <p className="text-sm text-neutral-500">No organizations onboarded yet.</p>
          ) : null}
          <ul className="divide-y divide-[#dfeae7]">
            {organizations.map((org) => (
              <li key={org.id} className="py-3 text-sm">
                <p className="font-medium text-neutral-900">{org.name}</p>
                <p className="text-neutral-500">
                  PAN: {org.pan} · {org.orgType}
                </p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </AppShell>
  );
}
