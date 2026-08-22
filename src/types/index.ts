import "next-auth";

export const USER_ROLES = ["ADMIN", "HR_OFFICER", "EMPLOYEE"] as const;

export type AppRole = (typeof USER_ROLES)[number];

export const ADMIN_ACCESS_ROLES: ReadonlySet<AppRole> = new Set([
  "ADMIN",
  "HR_OFFICER",
]);

declare module "next-auth" {
  interface User {
    id: string;
    employeeId: string;
    role: AppRole;
  }

  interface Session {
    user: {
      id: string;
      employeeId: string;
      role: AppRole;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}
