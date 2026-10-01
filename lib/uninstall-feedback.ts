export interface UninstallFeedback {
  reason: string;
  expectations: string;
  email: string;
}

/** Accept only the survey fields, with no account or extension identifiers. */
export function parseUninstallFeedback(body: unknown): UninstallFeedback | null {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null;
  const data = body as Record<string, unknown>;
  const limits = { reason: 3000, expectations: 3000, email: 254, website: 200 };
  const values: Record<string, string> = {};
  for (const [key, limit] of Object.entries(limits)) {
    const value = data[key] ?? '';
    if (typeof value !== 'string' || value.length > limit) return null;
    values[key] = value.trim();
  }
  if (!values.reason || values.website) return null;
  if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) return null;
  return { reason: values.reason, expectations: values.expectations, email: values.email };
}
