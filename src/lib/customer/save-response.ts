import type {CustomerSite} from "@/types/customer-site";
import {parseCustomerContent} from "@/lib/customer/validation";
/** Accept only a complete response for the store being edited. Never echo response data. */
export function parseCustomerSaveResponse(value:unknown,expected:Pick<CustomerSite,"id"|"slug">):CustomerSite {
 const invalid=()=>new Error("保存結果を確認できませんでした。入力は残っています。別タブで保存済みのサイトを確認してください。");
 try {
  if(!value||typeof value!=="object"||Array.isArray(value))throw invalid();
  const v=value as Record<string,unknown>;
  if(v.id!==expected.id||v.slug!==expected.slug||typeof v.name!=="string"||!v.name.trim()||v.name.length>4000||!['published','draft','suspended'].includes(String(v.publishStatus)))throw invalid();
  if(v.monthlyFee!==null&&(typeof v.monthlyFee!=="number"||!Number.isSafeInteger(v.monthlyFee)||v.monthlyFee<0||v.monthlyFee>1000000))throw invalid();
  for(const key of ['contractStartDate','minimumTermEndDate','nextBillingDate'])if(v[key]!==null&&(typeof v[key]!=="string"||!/^\d{4}-\d{2}-\d{2}$/.test(v[key])||!Number.isFinite(Date.parse(v[key]))||new Date(v[key]).toISOString().slice(0,10)!==v[key]))throw invalid();
  if(v.billingStatus!==null&&typeof v.billingStatus!=="string")throw invalid();
  if(typeof v.revision!=="string"||!/^\d{4}-\d{2}-\d{2}T/.test(v.revision)||!Number.isFinite(Date.parse(v.revision)))throw invalid();
  if(v.contractStatus!==undefined&&!['demo','contracted','suspended','ended','lost'].includes(String(v.contractStatus)))throw invalid();
  return {...(v.contractStatus!==undefined?{contractStatus:v.contractStatus as string}:{}),id:expected.id,slug:expected.slug,name:v.name,publishStatus:v.publishStatus as string,monthlyFee:v.monthlyFee as number|null,contractStartDate:v.contractStartDate as string|null,minimumTermEndDate:v.minimumTermEndDate as string|null,nextBillingDate:v.nextBillingDate as string|null,billingStatus:v.billingStatus as string|null,revision:v.revision,content:parseCustomerContent(v.content)};
 }catch{throw invalid();}
}
