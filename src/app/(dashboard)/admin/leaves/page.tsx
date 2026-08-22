import { LeaveStatus, UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function AdminLeavesPage() {
  const session = await auth();

  if (!session?.user.id) {
    redirect("/sign-in");
  }

  const requests = await db.leaveRequest.findMany({
    include: {
      applicant: {
        select: {
          employeeId: true,
          email: true,
        },
      },
      approver: {
        select: {
          employeeId: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  async function updateLeaveStatus(formData: FormData) {
    "use server";

    const currentSession = await auth();

    if (!currentSession?.user.id) {
      redirect("/sign-in");
    }

    if (currentSession.user.role !== UserRole.ADMIN && currentSession.user.role !== UserRole.HR_OFFICER) {
      redirect("/employee/profile");
    }

    const requestId = String(formData.get("requestId") ?? "");
    const status = String(formData.get("status") ?? LeaveStatus.PENDING) as LeaveStatus;
    const hrComments = String(formData.get("hrComments") ?? "").trim();

    if (!requestId || !Object.values(LeaveStatus).includes(status)) {
      return;
    }

    await db.leaveRequest.update({
      where: { id: requestId },
      data: {
        status,
        hrComments: hrComments || null,
        approverId: currentSession.user.id,
      },
    });

    revalidatePath("/admin/leaves");
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <h1 className="mb-4 text-xl font-semibold">Leave Workflow</h1>
      <div className="space-y-3">
        {requests.map((request) => (
          <form key={request.id} action={updateLeaveStatus} className="rounded-md border border-slate-200 p-3">
            <input type="hidden" name="requestId" value={request.id} />
            <p className="font-medium">
              {request.applicant.employeeId} ({request.applicant.email}) — {request.leaveType}
            </p>
            <p className="text-sm text-slate-600">
              {request.startDate.toDateString()} - {request.endDate.toDateString()} | Status: {request.status}
            </p>
            <Input name="hrComments" placeholder="HR comments" defaultValue={request.hrComments ?? ""} className="my-2" />
            <div className="flex gap-2">
              <Button type="submit" name="status" value={LeaveStatus.APPROVED}>Approve</Button>
              <Button type="submit" name="status" value={LeaveStatus.REJECTED} variant="destructive">Reject</Button>
            </div>
          </form>
        ))}
      </div>
    </section>
  );
}
