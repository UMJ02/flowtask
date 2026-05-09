export type MutationConfirmationResult<T> = {
  data: T | null;
  error: Error | null;
};

export function requireConfirmedRow<T>(data: T | null | undefined, fallbackMessage = "No pudimos confirmar el cambio en la base de datos."): T {
  if (!data) {
    throw new Error(fallbackMessage);
  }
  return data;
}

export function getMutationErrorMessage(error: unknown, fallback = "No pudimos guardar los cambios. Intenta de nuevo.") {
  if (!error) return fallback;
  if (typeof error === "string") return error;
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "object" && error && "message" in error && typeof (error as any).message === "string") return (error as any).message;
  return fallback;
}

export function assertAffectedRows<T>(rows: T[] | null | undefined, fallbackMessage = "No pudimos confirmar el cambio en Supabase."): T[] {
  if (!rows || rows.length === 0) {
    throw new Error(fallbackMessage);
  }
  return rows;
}
