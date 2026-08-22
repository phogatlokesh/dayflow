import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function EmployeeProfilePage() {
  const session = await auth();

  if (!session?.user.id) {
    redirect("/sign-in");
  }

  const profile = await db.employeeProfile.findUnique({
    where: { userId: session.user.id },
  });

  async function updateEditableFields(formData: FormData) {
    "use server";

    const currentSession = await auth();

    if (!currentSession?.user.id) {
      redirect("/sign-in");
    }

    await db.employeeProfile.update({
      where: { userId: currentSession.user.id },
      data: {
        phone: String(formData.get("phone") ?? "").trim() || null,
        address: String(formData.get("address") ?? "").trim() || null,
        avatarUrl: String(formData.get("avatarUrl") ?? "").trim() || null,
      },
    });

    revalidatePath("/employee/profile");
  }

  return (
    <section className="space-y-4">
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h1 className="mb-4 text-xl font-semibold">Employee Profile</h1>
        <div className="grid gap-3 text-sm sm:grid-cols-2">
          <p><strong>First Name:</strong> {profile?.firstName ?? "-"}</p>
          <p><strong>Last Name:</strong> {profile?.lastName ?? "-"}</p>
          <p><strong>Job Title:</strong> {profile?.jobTitle ?? "-"}</p>
          <p><strong>Department:</strong> {profile?.department ?? "-"}</p>
          <p><strong>Joining Date:</strong> {profile?.joiningDate?.toDateString() ?? "-"}</p>
          <p><strong>Base Salary:</strong> {profile?.baseSalary?.toString() ?? "-"}</p>
          <p className="sm:col-span-2"><strong>Documents URL:</strong> {profile?.documentsUrl ?? "-"}</p>
        </div>
      </div>

      <form action={updateEditableFields} className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="mb-4 text-lg font-semibold">Edit Contact Info</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input name="phone" placeholder="Phone" defaultValue={profile?.phone ?? ""} />
          <Input name="avatarUrl" placeholder="Avatar URL" defaultValue={profile?.avatarUrl ?? ""} />
          <Input name="address" placeholder="Address" defaultValue={profile?.address ?? ""} className="sm:col-span-2" />
          <Button type="submit" className="sm:col-span-2">Save Profile</Button>
        </div>
      </form>
    </section>
  );
}
