import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PlatformOverviewPage() {
  return (
    <AppShell
      title="Platform overview"
      description="Monitor tenant health, billing, and compliance across all NGOs."
    >
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Active organizations</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-neutral-900">—</p>
            <p className="text-sm text-neutral-500">Onboarded tenants</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">MRR</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-neutral-900">—</p>
            <p className="text-sm text-neutral-500">Billing module pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Compliance alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-neutral-900">—</p>
            <p className="text-sm text-neutral-500">FCRA / 80G exceptions</p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
