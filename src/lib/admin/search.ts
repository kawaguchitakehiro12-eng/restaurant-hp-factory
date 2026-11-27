/** Normalize only for lookup; stored names and business values are never changed. */
export function normalizeSearch(value: string): string { return value.normalize("NFKC").toLocaleLowerCase("ja-JP").replace(/\s+/gu," ").trim(); }
export function matchesSearch(query: string, values: (string | undefined | null)[]): boolean {
  const text = normalizeSearch(values.filter(Boolean).join(" "));
  return normalizeSearch(query).split(" ").filter(Boolean).every(word => text.includes(word));
}
