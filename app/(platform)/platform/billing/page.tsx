import { PlatformShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function BillingPage() {
  return (
    <PlatformShell
      title="Billing"
      description="Subscription plans, usage meters, and upgrade triggers."
    >
      <Card className="border-zinc-800 bg-zinc-900 text-zinc-100">
        <CardHeader>
          <CardTitle className="text-base">Billing console (shell)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-zinc-400">
            Placeholder for tenant billing, free-tier usage alerts, and Render/Supabase upgrade
            triggers. Wire to backend `finance` module when OpenAPI is ready.
          </p>
        </CardContent>
      </Card>
    </PlatformShell>
  );
}
