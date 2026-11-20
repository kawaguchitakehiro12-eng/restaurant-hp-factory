import type { RemotePattern } from "next/dist/shared/lib/image-config";

/**
 * next/image で最適化表示するホスト名。
 * next.config.ts の remotePatterns と同期すること。
 */
export const NEXT_IMAGE_REMOTE_HOSTS = [
  "images.unsplash.com",
  "tblg.k-img.com",
  "k-img.com",
  "cdninstagram.com",
  "fbcdn.net",
  "instagram.com",
] as const;

/** next.config images.remotePatterns 用（単一ソース） */
export function buildNextImageRemotePatterns(): RemotePattern[] {
  const patterns: RemotePattern[] = [
    {
      protocol: "https",
      hostname: "images.unsplash.com",
      pathname: "/**",
    },
    {
      protocol: "https",
      hostname: "tblg.k-img.com",
      pathname: "/**",
    },
    {
      protocol: "https",
      hostname: "**.k-img.com",
      pathname: "/**",
    },
    {
      protocol: "https",
      hostname: "**.cdninstagram.com",
      pathname: "/**",
    },
    {
      protocol: "https",
      hostname: "**.fbcdn.net",
      pathname: "/**",
    },
    {
      protocol: "https",
      hostname: "**.instagram.com",
      pathname: "/**",
    },
  ];

  return patterns;
}

function hostnameMatchesAllowed(hostname: string, allowed: string): boolean {
  const host = hostname.toLowerCase();
  const rule = allowed.toLowerCase();

  if (host === rule) return true;
  if (host.endsWith(`.${rule}`)) return true;
  if (rule.startsWith("**.")) {
    const suffix = rule.slice(1);
    return host.endsWith(suffix) || host === suffix.slice(1);
  }
  return false;
}

/** next/image で表示してよいリモート URL か */
export function isNextImageRemoteAllowed(src: string): boolean {
  if (!src || src.startsWith("/")) return true;

  try {
    const { hostname, protocol } = new URL(src);
    if (protocol !== "http:" && protocol !== "https:") return false;
    return NEXT_IMAGE_REMOTE_HOSTS.some((allowed) =>
      hostnameMatchesAllowed(hostname, allowed)
    );
  } catch {
    return false;
  }
}
