import { LeaveStatus, LeaveType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { LeaveSummaryCard } from "@/components/leave/leave-summary-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function EmployeeLeavesPage() {
  const session = await auth();

  if (!session?.user.id) {
    redirect("/sign-in");
  }

  const leaves = await db.leaveRequest.findMany({
    where: { applicantId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  async function applyLeaveAction(formData: FormData) {
    "use server";

    const currentSession = await auth();

    if (!currentSession?.user.id) {
      redirect("/sign-in");
    }

    const leaveType = String(formData.get("leaveType") ?? LeaveType.PAID) as LeaveType;
    const startDate = String(formData.get("startDate") ?? "");
    const endDate = String(formData.get("endDate") ?? "");
    const remarks = String(formData.get("remarks") ?? "").trim();

    if (!startDate || !endDate) {
      return;
    }

    await db.leaveRequest.create({
      data: {
        applicantId: currentSession.user.id,
        leaveType,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        remarks,
        status: LeaveStatus.PENDING,
      },
    });

    revalidatePath("/employee/leaves");
  }

  return (
    <section className="space-y-4">
      <LeaveSummaryCard pendingCount={leaves.filter((leave) => leave.status === LeaveStatus.PENDING).length} />

      <details className="rounded-lg border border-slate-200 bg-white p-4">
        <summary className="cursor-pointer font-medium">Apply for leave</summary>
        <form action={applyLeaveAction} className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="space-y-1 text-sm">
            <span>Leave Type</span>
            <select name="leaveType" className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm" defaultValue={LeaveType.PAID}>
              {Object.values(LeaveType).map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-sm">
            <span>Remarks</span>
            <Input name="remarks" placeholder="Optional details" />
          </label>
          <label className="space-y-1 text-sm">
            <span>Start Date</span>
            <Input name="startDate" type="date" required />
          </label>
          <label className="space-y-1 text-sm">
            <span>End Date</span>
            <Input name="endDate" type="date" required />
          </label>
          <Button type="submit" className="sm:col-span-2">Submit Leave Request</Button>
        </form>
      </details>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="mb-3 text-lg font-semibold">My Leave Requests</h2>
        <ul className="space-y-2 text-sm">
          {leaves.length === 0 ? <li className="text-slate-500">No leave requests submitted yet.</li> : null}
          {leaves.map((leave) => (
            <li key={leave.id} className="rounded-md border border-slate-200 p-3">
              <p className="font-medium">{leave.leaveType} ({leave.status})</p>
              <p>{leave.startDate.toDateString()} - {leave.endDate.toDateString()}</p>
              {leave.remarks ? <p className="text-slate-600">{leave.remarks}</p> : null}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
