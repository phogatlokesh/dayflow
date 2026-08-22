import { CalendarRange } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type LeaveSummaryCardProps = {
  pendingCount: number;
};

export function LeaveSummaryCard({ pendingCount }: LeaveSummaryCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarRange className="h-5 w-5" />
          Leave Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p>Pending Requests: <strong>{pendingCount}</strong></p>
      </CardContent>
    </Card>
  );
}
