import { RoleCode } from "@prisma/client";

import { requireSession } from "@/auth";
import { jsonError, jsonOk } from "@/lib/http";
import { upsertMenuSelection, menuSelectionSchema } from "@/modules/menus/menu-service";

export async function POST(request: Request) {
  const session = await requireSession();
  try {
    const payload = menuSelectionSchema.parse(await request.json());
    if (session.user.roleCode === RoleCode.EMPLOYEE && session.user.employeeId !== payload.employeeId) {
      return jsonError("No puedes seleccionar menu para otro trabajador.", 403);
    }
    const selection = await upsertMenuSelection(payload);
    return jsonOk({ selection }, 201);
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "No fue posible guardar la seleccion.", 400, error);
  }
}
