import { auth } from "@/auth";
import { can, ERPModule, ERPAction } from "./rbac";

export const ROLES = {
  SUPER_ADMIN: "Super Admin",
  HR_ADMIN: "Corporate Admin",
  BRANCH_HEAD: "BRANCH_HEAD",
  DEPT_HEAD: "DEPT_HEAD",
  CONTENT_MOD: "CONTENT_MOD",
  WELFARE_ADMIN: "WELFARE_ADMIN",
  STAFF: "User"
} as const;

export type RoleType = keyof typeof ROLES;

// Utility to check if current user has one of the allowed roles (Legacy Support)
export async function hasPermission(allowedRoles: RoleType[] | string[]) {
  const session = await auth();
  const user = session?.user as any;
  if (!user?.roleName) return false;
  
  // Super Admin bypass
  if (user.roleName === "Super Admin") return true;

  return (allowedRoles as string[]).includes(user.roleName);
}

export async function isSuperAdmin() {
  const session = await auth();
  return (session?.user as any)?.roleName === "Super Admin";
}

// NEW ERP-wide access utility
export { can };
