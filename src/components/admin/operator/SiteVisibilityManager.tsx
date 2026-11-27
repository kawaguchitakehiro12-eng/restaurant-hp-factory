"use client";
import {matchesSearch} from "@/lib/admin/search";
import { useState } from "react";
import { useOperatorAdmin } from "@/components/admin/operator/OperatorAdminProvider";
import { throwIfAuthError } from "@/lib/data/api-errors";
import type { DemoSite } from "@/types/demo";
export function SiteVisibilityManager(){
 const {demoSites,reportAuthError,applySavedSite}=useOperatorAdmin();const[query,setQuery]=useState("");const[busy,setBusy]=useState<string|null>(null),[error,setError]=useState("");
 async function change(site:DemoSite){
  const action=site.publishStatus==="suspended"?"resume":"suspend";
  if(!window.confirm(action==="suspend"?"通常URL・共有URLからの閲覧を停止しますか？":"閲覧を再開しますか？未契約デモは共有URLからのみ閲覧できます。"))return;
  setBusy(site.id);setError("");try{const res=await fetch(`/api/admin/sites/${encodeURIComponent(site.id)}/visibility`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action,expectedPublishStatus:site.publishStatus})});throwIfAuthError(res);const result=await res.json();if(!res.ok)throw Error(result.error??"保存できませんでした。");applySavedSite(result.site);}catch(cause){reportAuthError(cause);setError(cause instanceof Error?cause.message:"接続できません。");}finally{setBusy(null)}
 }
 return <><label className="admin-form-label">店舗を検索<input type="search" className="admin-form-input" value={query} onChange={e=>setQuery(e.target.value)} placeholder="店舗名・住所・URL名"/></label><p>正式公開は契約済み店舗だけです。未契約デモの再開は共有URLの閲覧のみを許可します。</p>{error&&<p className="admin-form-error" role="alert">{error}</p>}<div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>店舗</th><th>状態</th><th>操作</th></tr></thead><tbody>{demoSites.filter(site=>matchesSearch(query,[site.storeName,site.storeSlug,site.address])).map(site=>{return <tr key={site.id}><td>{site.storeName}</td><td>{site.publishStatus==="suspended"?"停止中":site.siteContractStatus==="contracted"&&site.publishStatus==="published"?"正式公開中":"共有URL限定"}</td><td><button type="button" className="admin-btn admin-btn--secondary" disabled={Boolean(busy)||!["demo","contracted"].includes(site.siteContractStatus)} onClick={()=>void change(site)}>{busy===site.id?"処理中…":site.publishStatus==="suspended"?"閲覧を再開":"閲覧を停止"}</button></td></tr>})}</tbody></table></div></>;
}
