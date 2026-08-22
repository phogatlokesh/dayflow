import { Clock3 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type CheckInCardProps = {
  checkIn?: string;
  checkOut?: string;
  status: string;
};

export function CheckInCard({ checkIn, checkOut, status }: CheckInCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock3 className="h-5 w-5" />
          Today&apos;s Attendance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p>Status: <strong>{status}</strong></p>
        <p>Check-In: {checkIn ?? "Not checked in"}</p>
        <p>Check-Out: {checkOut ?? "Not checked out"}</p>
      </CardContent>
    </Card>
  );
}
