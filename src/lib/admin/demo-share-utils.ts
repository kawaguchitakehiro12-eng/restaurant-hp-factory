import { randomBytes } from "crypto";
import type { ShareExpiryOption } from "@/types/demo-share";
import type { DemoShare } from "@/types/demo-share";

export function generateShareToken(): string {
  return randomBytes(32).toString("base64url");
}

export function computeShareExpiresAt(option:ShareExpiryOption):string{if(option!=='7d')throw new Error('共有URLの有効期限は1週間です。');return new Date(Date.now()+7*86400000).toISOString();}
export function effectiveShareExpiry(share:DemoShare):number{const created=Date.parse(share.createdAt);if(!Number.isFinite(created))return 0;const end=share.expiresAt?Date.parse(share.expiresAt):Infinity;return Number.isNaN(end)?0:Math.min(end,created+7*86400000);}
export function isDemoShareValid(share:DemoShare):boolean{return share.isActive&&effectiveShareExpiry(share)>Date.now();}
export function shareExpiryFromIso(expiresAt: string | null): ShareExpiryOption {
  if (!expiresAt) return "never";
  const exp = new Date(expiresAt);
  const now = new Date();
  const diffDays = Math.round((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 8) return "7d";
  return "7d";
}
