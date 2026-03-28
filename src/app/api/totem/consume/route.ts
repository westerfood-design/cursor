import { z } from "zod";

import { jsonError, jsonOk } from "@/lib/http";
import { consumeTicketFromTotem } from "@/modules/tickets/ticket-service";

const schema = z.object({
  clientSlug: z.string().min(1),
  deviceCode: z.string().min(1),
  ticketId: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const payload = schema.parse(await request.json());
    const ticket = await consumeTicketFromTotem(payload);
    return jsonOk({ status: ticket.status === "CONSUMED" ? "CONSUMED" : "VALID", message: ticket.status === "CONSUMED" ? "Consumo registrado correctamente." : "Ticket actualizado.", ticket });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "No fue posible validar el ticket.", 400, error);
  }
}
