import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function BillingPage() {
  return (
    <AppShell
      title="Billing"
      description="Subscription plans, usage meters, and upgrade triggers."
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Billing console</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-neutral-500">
            Placeholder for tenant billing, free-tier usage alerts, and upgrade triggers. Wire to
            the finance module when those APIs are ready.
          </p>
        </CardContent>
      </Card>
    </AppShell>
  );
}
