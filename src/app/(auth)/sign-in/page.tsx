import Link from "next/link";
import { AuthError } from "next-auth";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { signIn } from "@/lib/auth";

export default function SignInPage() {
  async function signInAction(formData: FormData) {
    "use server";

    try {
      await signIn("credentials", {
        email: formData.get("email"),
        password: formData.get("password"),
        redirectTo: "/",
      });
    } catch (error) {
      if (error instanceof AuthError) {
        return;
      }
      throw error;
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Sign in to Dayflow</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={signInAction} className="space-y-4">
            <Input name="email" type="email" placeholder="you@company.com" required />
            <Input name="password" type="password" placeholder="••••••••" required />
            <Button type="submit" className="w-full">
              Sign In
            </Button>
          </form>
          <p className="mt-4 text-sm text-slate-600">
            Need an account? <Link href="/sign-up" className="font-medium text-blue-600">Sign up</Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
