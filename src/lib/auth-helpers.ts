import { OWNER_NAME } from "@/lib/constants";

export const DEFAULT_ADMIN_SESSION = {
  user: {
    id: "admin",
    name: OWNER_NAME,
    email: "sanchitha@saaga-institute.com",
    role: "admin" as const,
    teacherId: undefined as string | undefined,
  },
};

export async function getSession() {
  return DEFAULT_ADMIN_SESSION;
}

export async function requireAuth() {
  return DEFAULT_ADMIN_SESSION;
}

export async function requireAdmin() {
  return DEFAULT_ADMIN_SESSION;
}

export function isAdmin(role?: string) {
  return !role || role === "admin";
}
