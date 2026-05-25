export function flattenFieldErrors(err: unknown): Record<string, string> | null {
  const e = err as { errors?: Record<string, string[]> } | null;
  if (!e?.errors) return null;
  const flat: Record<string, string> = {};
  for (const [key, msgs] of Object.entries(e.errors)) {
    flat[key] = msgs[0];
  }
  return flat;
}

export function getErrorMessage(err: unknown, fallback: string): string {
  const e = err as { message?: string } | null;
  return e?.message ?? fallback;
}
