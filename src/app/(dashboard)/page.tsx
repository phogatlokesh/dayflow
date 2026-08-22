import Link from "next/link";

import { auth } from "@/lib/auth";

export default async function DashboardHomePage() {
  const session = await auth();
  const isAdmin = session?.user.role === "ADMIN" || session?.user.role === "HR_OFFICER";

  return (
    <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-6">
      <h1 className="text-2xl font-semibold">Welcome to Dayflow</h1>
      <p className="text-slate-600">Choose a workspace to continue.</p>
      <div className="flex flex-wrap gap-3 text-sm">
        <Link href="/employee/attendance" className="rounded-md border border-slate-300 px-4 py-2">Employee Attendance</Link>
        <Link href="/employee/leaves" className="rounded-md border border-slate-300 px-4 py-2">Employee Leaves</Link>
        {isAdmin ? <Link href="/admin/leaves" className="rounded-md border border-slate-300 px-4 py-2">Admin Leaves</Link> : null}
      </div>
    </section>
  );
}
