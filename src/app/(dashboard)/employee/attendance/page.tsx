import { AttendanceStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { CheckInCard } from "@/components/attendance/check-in-card";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

function startOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

export default async function EmployeeAttendancePage() {
  const session = await auth();

  if (!session?.user.id) {
    redirect("/sign-in");
  }

  const today = startOfToday();
  const attendance = await db.attendance.findUnique({
    where: {
      userId_date: {
        userId: session.user.id,
        date: today,
      },
    },
  });

  async function checkInAction() {
    "use server";

    const currentSession = await auth();

    if (!currentSession?.user.id) {
      redirect("/sign-in");
    }

    const date = startOfToday();

    await db.attendance.upsert({
      where: {
        userId_date: {
          userId: currentSession.user.id,
          date,
        },
      },
      create: {
        userId: currentSession.user.id,
        date,
        checkIn: new Date(),
        status: AttendanceStatus.PRESENT,
      },
      update: {
        checkIn: new Date(),
        status: AttendanceStatus.PRESENT,
      },
    });

    revalidatePath("/employee/attendance");
  }

  async function checkOutAction() {
    "use server";

    const currentSession = await auth();

    if (!currentSession?.user.id) {
      redirect("/sign-in");
    }

    const date = startOfToday();

    await db.attendance.update({
      where: {
        userId_date: {
          userId: currentSession.user.id,
          date,
        },
      },
      data: {
        checkOut: new Date(),
      },
    });

    revalidatePath("/employee/attendance");
  }

  return (
    <section className="space-y-4">
      <CheckInCard
        checkIn={attendance?.checkIn?.toLocaleTimeString()}
        checkOut={attendance?.checkOut?.toLocaleTimeString()}
        status={attendance?.status ?? "PRESENT"}
      />
      <div className="flex gap-3">
        <form action={checkInAction}>
          <Button type="submit">Check In</Button>
        </form>
        <form action={checkOutAction}>
          <Button type="submit" variant="outline" disabled={!attendance?.checkIn}>
            Check Out
          </Button>
        </form>
      </div>
    </section>
  );
}
