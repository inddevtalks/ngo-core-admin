import { AppShell } from "./app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function WorkInProgressPage({
  title,
  section,
}: {
  title: string;
  section: string;
}) {
  return (
    <AppShell title={title} description={`${section} workspace`}>
      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle className="text-base">Coming soon</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-neutral-500">
            This module is on the Phase 2 roadmap. Organization onboarding and tenant
            management are available today under Organizations.
          </p>
        </CardContent>
      </Card>
    </AppShell>
  );
}
