import Link from "next/link";
import { UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { db } from "@/lib/db";

export default function SignUpPage() {
  async function signUpAction(formData: FormData) {
    "use server";

    const employeeId = String(formData.get("employeeId") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const password = String(formData.get("password") ?? "");
    const firstName = String(formData.get("firstName") ?? "").trim();
    const lastName = String(formData.get("lastName") ?? "").trim();

    if (!employeeId || !email || !password || !firstName || !lastName) {
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await db.user.create({
      data: {
        employeeId,
        email,
        passwordHash,
        role: UserRole.EMPLOYEE,
        employeeProfile: {
          create: {
            firstName,
            lastName,
            jobTitle: "Associate",
            department: "General",
            joiningDate: new Date(),
            baseSalary: 0,
          },
        },
      },
    });

    redirect("/sign-in");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl items-center px-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Create your Dayflow account</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={signUpAction} className="grid gap-4 sm:grid-cols-2">
            <Input name="firstName" placeholder="First name" required />
            <Input name="lastName" placeholder="Last name" required />
            <Input name="employeeId" placeholder="Employee ID" required />
            <Input name="email" type="email" placeholder="you@company.com" required />
            <Input name="password" type="password" placeholder="Create password" required className="sm:col-span-2" />
            <Button type="submit" className="sm:col-span-2">Create Account</Button>
          </form>
          <p className="mt-4 text-sm text-slate-600">
            Already registered? <Link href="/sign-in" className="font-medium text-blue-600">Sign in</Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
