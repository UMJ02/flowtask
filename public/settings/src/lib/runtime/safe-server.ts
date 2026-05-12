export async function safeServerCall<T>(
  label: string,
  work: () => Promise<T>,
  fallback: T,
): Promise<T> {
  try {
    return await work();
  } catch (error) {
    console.error(`[safeServerCall] ${label}`, error);
    return fallback;
  }
}
