import { z } from "zod";

export const taskSchema = z.object({
  title: z.string().min(2, "Ingresa un título"),
  description: z.string().optional(),
  status: z.enum(["en_proceso", "en_espera", "concluido"]),
  priority: z.enum(["baja", "media", "alta"]).default("media"),
  department: z.string().optional(),
  clientName: z.string().optional(),
  dueDate: z.string().optional(),
  projectId: z.string().optional(),
  country: z.string().optional(),
});
