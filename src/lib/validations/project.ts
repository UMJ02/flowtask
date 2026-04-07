import { z } from "zod";

export const projectSchema = z.object({
  title: z.string().min(2, "Ingresa un nombre"),
  description: z.string().optional(),
  status: z.enum(["activo", "en_pausa", "completado", "vencido"]),
  clientName: z.string().optional(),
  department: z.string().optional(),
  dueDate: z.string().optional(),
  isCollaborative: z.boolean().default(false),
  country: z.string().optional(),
});
