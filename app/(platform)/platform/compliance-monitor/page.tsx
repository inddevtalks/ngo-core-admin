import { PlatformShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ComplianceMonitorPage() {
  return (
    <PlatformShell
      title="Compliance monitor"
      description="Cross-tenant 80G, FCRA, and DPDP compliance signals."
    >
      <Card className="border-zinc-800 bg-zinc-900 text-zinc-100">
        <CardHeader>
          <CardTitle className="text-base">Compliance dashboard (shell)</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc space-y-2 pl-5 text-sm text-zinc-400">
            <li>80G receipt sequence gaps</li>
            <li>FCRA / domestic fund mixing alerts</li>
            <li>Form 10BD export readiness</li>
            <li>DPDP consent and audit log coverage</li>
          </ul>
        </CardContent>
      </Card>
    </PlatformShell>
  );
}
