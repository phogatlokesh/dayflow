import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function EmployeeSalaryPage() {
  const session = await auth();

  if (!session?.user.id) {
    redirect("/sign-in");
  }

  const profile = await db.employeeProfile.findUnique({
    where: { userId: session.user.id },
  });

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6">
      <h1 className="mb-4 text-xl font-semibold">Salary (Read-Only)</h1>
      <p className="text-sm text-slate-600">Only HR/Admin users can modify payroll values.</p>
      <dl className="mt-4 grid gap-2 text-sm">
        <div className="flex justify-between border-b border-slate-100 py-2">
          <dt>Base Salary</dt>
          <dd>{profile?.baseSalary?.toString() ?? "0.00"}</dd>
        </div>
        <div className="flex justify-between border-b border-slate-100 py-2">
          <dt>Department</dt>
          <dd>{profile?.department ?? "-"}</dd>
        </div>
        <div className="flex justify-between py-2">
          <dt>Job Title</dt>
          <dd>{profile?.jobTitle ?? "-"}</dd>
        </div>
      </dl>
    </section>
  );
}
