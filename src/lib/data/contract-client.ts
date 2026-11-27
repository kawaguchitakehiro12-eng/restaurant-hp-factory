import type {CustomerAccount} from "@/types/admin";
import type {DemoSite,PublishSiteForm} from "@/types/demo";
import {throwIfAuthError} from "@/lib/data/api-errors";
const operations=new Map<string,string>();
export async function completeSiteContract(id:string,form:PublishSiteForm):Promise<{site:DemoSite;customer:CustomerAccount}> {
 const requestId=operations.get(id)??crypto.randomUUID();operations.set(id,requestId);
 const response=await fetch(`/api/admin/sites/${encodeURIComponent(id)}/contract`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...form,requestId})});
 throwIfAuthError(response);const body=await response.json();
 if(!response.ok){if(body.retryable===true)operations.delete(id);throw new Error(typeof body.error==="string"?body.error:"契約処理を確認できませんでした。");}
 if(!body.site||!body.customer)throw new Error("契約処理の結果を確認できませんでした。");
 operations.delete(id);return body;
}
