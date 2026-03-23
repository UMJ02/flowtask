import { format } from "date-fns";

export function formatDate(value?: string | Date | null) {
  if (!value) return "—";
  return format(new Date(value), "dd/MM/yyyy");
}
