import { RoleCode } from "@prisma/client";
import { redirect } from "next/navigation";

import { requireSession } from "@/auth";

export default async function HomePage() {
  const session = await requireSession();

  if (session.user.roleCode === RoleCode.WESTERFOOD_ADMIN) {
    redirect("/admin/clients");
  }

  if (session.user.roleCode === RoleCode.CLIENT_HR) {
    redirect("/hr/employees");
  }

  redirect("/my-menu");
}
