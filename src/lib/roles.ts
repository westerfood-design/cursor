import { RoleCode } from "@prisma/client";

export const ROLE_LABELS: Record<RoleCode, string> = {
  WESTERFOOD_ADMIN: "Admin WesterFood",
  CLIENT_HR: "RRHH Cliente",
  EMPLOYEE: "Trabajador",
};

export function isAdmin(roleCode?: RoleCode | null) {
  return roleCode === RoleCode.WESTERFOOD_ADMIN;
}

export function isClientManager(roleCode?: RoleCode | null) {
  return roleCode === RoleCode.CLIENT_HR;
}

export function isEmployeeRole(roleCode?: RoleCode | null) {
  return roleCode === RoleCode.EMPLOYEE;
}
