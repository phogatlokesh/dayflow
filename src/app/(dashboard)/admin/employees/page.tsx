import { UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function AdminEmployeesPage() {
  const session = await auth();

  if (!session?.user.id) {
    redirect("/sign-in");
  }

  const users = await db.user.findMany({
    include: { employeeProfile: true },
    orderBy: { createdAt: "desc" },
  });

  async function updateSalary(formData: FormData) {
    "use server";

    const currentSession = await auth();

    if (!currentSession?.user.id) {
      redirect("/sign-in");
    }

    if (currentSession.user.role !== UserRole.ADMIN && currentSession.user.role !== UserRole.HR_OFFICER) {
      redirect("/employee/profile");
    }

    const userId = String(formData.get("userId") ?? "");
    const baseSalary = Number(formData.get("baseSalary") ?? 0);

    if (!userId || Number.isNaN(baseSalary)) {
      return;
    }

    await db.employeeProfile.update({
      where: { userId },
      data: {
        baseSalary,
      },
    });

    revalidatePath("/admin/employees");
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <h1 className="mb-4 text-xl font-semibold">Employees</h1>
      <div className="space-y-3">
        {users.map((user) => (
          <div key={user.id} className="rounded-md border border-slate-200 p-3">
            <p className="font-medium">{user.employeeId} - {user.email}</p>
            <p className="text-sm text-slate-600">Role: {user.role}</p>
            <form action={updateSalary} className="mt-3 flex flex-wrap items-center gap-2">
              <input type="hidden" name="userId" value={user.id} />
              <Input
                name="baseSalary"
                type="number"
                step="0.01"
                defaultValue={user.employeeProfile?.baseSalary?.toString() ?? "0"}
                className="max-w-xs"
              />
              <Button type="submit" variant="secondary">Update Salary</Button>
            </form>
          </div>
        ))}
      </div>
    </section>
  );
}
