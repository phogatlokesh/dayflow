import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function AdminAttendancePage() {
  const session = await auth();

  if (!session?.user.id) {
    redirect("/sign-in");
  }

  const records = await db.attendance.findMany({
    include: {
      user: {
        select: {
          employeeId: true,
          email: true,
        },
      },
    },
    orderBy: [{ date: "desc" }, { checkIn: "desc" }],
  });

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <h1 className="mb-4 text-xl font-semibold">Attendance Oversight</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="py-2">Employee</th>
              <th className="py-2">Date</th>
              <th className="py-2">Check In</th>
              <th className="py-2">Check Out</th>
              <th className="py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.id} className="border-b border-slate-100">
                <td className="py-2">{record.user.employeeId} ({record.user.email})</td>
                <td className="py-2">{record.date.toDateString()}</td>
                <td className="py-2">{record.checkIn?.toLocaleTimeString() ?? "-"}</td>
                <td className="py-2">{record.checkOut?.toLocaleTimeString() ?? "-"}</td>
                <td className="py-2">{record.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
