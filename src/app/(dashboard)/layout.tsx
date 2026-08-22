import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { auth, signOut } from "@/lib/auth";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }

  const isAdmin = session.user.role === "ADMIN" || session.user.role === "HR_OFFICER";

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
          <div>
            <p className="text-sm text-slate-500">Dayflow HRMS</p>
            <p className="font-semibold">{session.user.employeeId}</p>
          </div>
          <nav className="flex items-center gap-3 text-sm">
            <Link href="/" className="font-medium text-slate-700 hover:text-blue-600">Dashboard</Link>
            <Link href="/employee/profile" className="font-medium text-slate-700 hover:text-blue-600">My Profile</Link>
            {isAdmin ? <Link href="/admin/employees" className="font-medium text-slate-700 hover:text-blue-600">Admin</Link> : null}
          </nav>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/sign-in" });
            }}
          >
            <button className="rounded-md border border-slate-300 px-3 py-1.5 text-sm" type="submit">
              Sign out
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl p-4">{children}</main>
    </div>
  );
}
