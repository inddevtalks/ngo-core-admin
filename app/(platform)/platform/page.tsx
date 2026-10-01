import { PlatformShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PlatformOverviewPage() {
  return (
    <PlatformShell
      title="Platform overview"
      description="Monitor tenant health, billing, and compliance across all NGOs."
    >
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-zinc-800 bg-zinc-900 text-zinc-100">
          <CardHeader>
            <CardTitle className="text-base">Active organizations</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">—</p>
            <p className="text-sm text-zinc-400">Onboarded tenants</p>
          </CardContent>
        </Card>
        <Card className="border-zinc-800 bg-zinc-900 text-zinc-100">
          <CardHeader>
            <CardTitle className="text-base">MRR</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">—</p>
            <p className="text-sm text-zinc-400">Billing module pending</p>
          </CardContent>
        </Card>
        <Card className="border-zinc-800 bg-zinc-900 text-zinc-100">
          <CardHeader>
            <CardTitle className="text-base">Compliance alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">—</p>
            <p className="text-sm text-zinc-400">FCRA / 80G exceptions</p>
          </CardContent>
        </Card>
      </div>
    </PlatformShell>
  );
}
