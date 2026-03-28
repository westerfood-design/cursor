import { RoleCode } from "@prisma/client";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      roleCode: RoleCode;
      clientId?: string | null;
      employeeId?: string | null;
    };
  }

  interface User {
    id: string;
    roleCode: RoleCode;
    clientId?: string | null;
    employeeId?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    roleCode?: RoleCode;
    clientId?: string | null;
    employeeId?: string | null;
  }
}
