import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ComplianceMonitorPage() {
  return (
    <AppShell
      title="Compliance monitor"
      description="Cross-tenant 80G, FCRA, and DPDP compliance signals."
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Compliance dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc space-y-2 pl-5 text-sm text-neutral-600">
            <li>80G receipt sequence gaps</li>
            <li>FCRA / domestic fund mixing alerts</li>
            <li>Form 10BD export readiness</li>
            <li>DPDP consent and audit log coverage</li>
          </ul>
        </CardContent>
      </Card>
    </AppShell>
  );
}
