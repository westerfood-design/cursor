import { z } from "zod";

import { jsonError, jsonOk } from "@/lib/http";
import { lookupTotemService } from "@/modules/tickets/ticket-service";

const schema = z.object({
  clientSlug: z.string().min(1),
  deviceCode: z.string().min(1),
  rut: z.string().min(7),
});

export async function POST(request: Request) {
  try {
    const payload = schema.parse(await request.json());
    const result = await lookupTotemService(payload);
    return jsonOk(result);
  } catch (error) {
    return jsonError("Error de validacion en totem.", 400, error);
  }
}
