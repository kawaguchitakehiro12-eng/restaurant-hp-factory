import { randomBytes } from "crypto";
import type { ShareExpiryOption } from "@/types/demo-share";
import type { DemoShare } from "@/types/demo-share";

export function generateShareToken(): string {
  return randomBytes(32).toString("base64url");
}

export function computeShareExpiresAt(option: ShareExpiryOption): string | null {
  if (option === "never") return null;
  const days = option === "7d" ? 7 : 30;
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

export function isDemoShareValid(share: DemoShare): boolean {
  if (!share.isActive) return false;
  if (share.expiresAt && new Date(share.expiresAt).getTime() < Date.now()) {
    return false;
  }
  return true;
}

export function shareExpiryFromIso(expiresAt: string | null): ShareExpiryOption {
  if (!expiresAt) return "never";
  const exp = new Date(expiresAt);
  const now = new Date();
  const diffDays = Math.round((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 8) return "7d";
  return "30d";
}
