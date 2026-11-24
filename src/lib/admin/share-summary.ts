import type {DemoShare, DemoShareSummary} from "@/types/demo-share";
export function shareState(share: DemoShare, now=Date.now()): "active"|"expired"|"revoked" {
  if (!share.isActive) return "revoked";
  if (share.expiresAt && (!Number.isFinite(Date.parse(share.expiresAt)) || Date.parse(share.expiresAt)<=now)) return "expired";
  return "active";
}
export function selectManagedShare(shares: DemoShare[], now=Date.now()): DemoShare|null {
  const ordered = [...shares].sort((a,b)=>Date.parse(b.createdAt)-Date.parse(a.createdAt));
  return ordered.find(share=>shareState(share,now)==="active") ?? ordered[0] ?? null;
}
export function summarizeShares(ids: string[], shares: DemoShare[], now=Date.now()): Record<string,DemoShareSummary> {
  const groups=new Map<string,DemoShare[]>();
  for(const share of shares){const list=groups.get(share.demoSiteId)??[];list.push(share);groups.set(share.demoSiteId,list)}
  return Object.fromEntries(ids.map(id=>{const share=selectManagedShare(groups.get(id)??[],now),status=share?shareState(share,now):"none";
    return [id,{demoSiteId:id,hasActiveShare:status==="active",activeShareId:status==="active"?share!.id:null,viewCount:share?.viewCount??0,firstViewedAt:share?.firstViewedAt??null,lastViewedAt:share?.lastViewedAt??null,status,expiresAt:share?.expiresAt??null}];}));
}
