import {isAuthUnavailable} from "@/lib/auth/service-error";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminDbClient } from "@/lib/supabase/admin";
import { ensureDemoContent } from "@/types/demo-content";
import type { DemoSiteContent } from "@/types/demo-content";
import type { CustomerSite } from "@/types/customer-site";

export class CustomerAccessError extends Error {
  constructor(public status:401|403|404|503) { super("Customer access denied"); }
}
export async function requireCustomerUser() {
  try {
    const client=await createServerSupabaseClient();
    const {data,error}=await client.auth.getUser();
    if(isAuthUnavailable(error))throw new CustomerAccessError(503);
    if(error || !data.user) throw new CustomerAccessError(401);
    return data.user;
  } catch(error) {
    if(error instanceof CustomerAccessError)throw error;
    throw new CustomerAccessError(503);
  }
}
const SELECT="id,store_slug,store_name,site_contract_status,publish_status,monthly_fee,contract_start_date,minimum_term_end_date,next_billing_date,billing_status,store_content(content,updated_at),customer:customers!inner(auth_user_id)";
type Row={site_contract_status:string;id:string;store_slug:string;store_name:string;publish_status:string;monthly_fee:number|null;contract_start_date:string|null;minimum_term_end_date:string|null;next_billing_date:string|null;billing_status:string|null;store_content:{content:DemoSiteContent;updated_at:string}[]|{content:DemoSiteContent;updated_at:string}|null};
export function toCustomerSite(row:Row):CustomerSite {
  const stored=Array.isArray(row.store_content)?row.store_content[0]:row.store_content;
  const normalized=ensureDemoContent(stored?.content);
  // 営業メモ、ログイン情報、写真取得元などを返さない許可リスト。
  return {id:row.id,slug:row.store_slug,name:row.store_name,publishStatus:row.publish_status,contractStatus:row.site_contract_status,monthlyFee:row.monthly_fee,contractStartDate:row.contract_start_date,minimumTermEndDate:row.minimum_term_end_date,nextBillingDate:row.next_billing_date,billingStatus:row.billing_status,content:{basicInfo:normalized.basicInfo,photos:normalized.photos,menus:normalized.menus,topics:normalized.topics},revision:stored?.updated_at??null};
}
export async function listCustomerSites(userId:string):Promise<CustomerSite[]> {
  const {data,error}=await createAdminDbClient().from("demo_sites").select(SELECT).eq("customer.auth_user_id",userId).order("store_name");
  if(error)throw new CustomerAccessError(503);
  return ((data??[]) as unknown as Row[]).map(toCustomerSite);
}
export async function getCustomerSite(userId:string,slug:string):Promise<CustomerSite> {
  const {data,error}=await createAdminDbClient().from("demo_sites").select(SELECT).eq("customer.auth_user_id",userId).eq("store_slug",slug).maybeSingle();
  if(error)throw new CustomerAccessError(503);
  if(!data)throw new CustomerAccessError(404);
  return toCustomerSite(data as unknown as Row);
}
