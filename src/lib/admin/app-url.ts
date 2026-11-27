/** App base URL for share links, demo URLs, etc. (never hardcode production domain). */
export function getAppBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (typeof window !== "undefined") return window.location.origin;
  return "http://localhost:3000";
}

export function buildShareUrl(shareToken: string): string {
  return `${getAppBaseUrl()}/share/${shareToken}`;
}
