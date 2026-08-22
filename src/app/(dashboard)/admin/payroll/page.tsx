import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function AdminPayrollPage() {
  const session = await auth();

  if (!session?.user.id) {
    redirect("/sign-in");
  }

  const payroll = await db.employeeProfile.findMany({
    include: {
      user: {
        select: {
          employeeId: true,
          email: true,
        },
      },
    },
    orderBy: { joiningDate: "asc" },
  });

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <h1 className="mb-4 text-xl font-semibold">Payroll</h1>
      <ul className="space-y-2 text-sm">
        {payroll.map((profile) => (
          <li key={profile.id} className="rounded-md border border-slate-200 p-3">
            <p className="font-medium">{profile.user.employeeId} - {profile.user.email}</p>
            <p>{profile.department} / {profile.jobTitle}</p>
            <p>Base Salary: {profile.baseSalary.toString()}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
