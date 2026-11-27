import type {CustomerSite} from '@/types/customer-site';
/** Independent contract/publication axes. Unknown contracts fail closed. */
export function customerAccess(site:Pick<CustomerSite,'contractStatus'|'publishStatus'>){
 const active=site.contractStatus==='contracted';
 return {edit:active,preview:active,external:active&&site.publishStatus==='published',ended:site.contractStatus==='suspended'||site.contractStatus==='ended',paused:active&&site.publishStatus==='suspended'};
}
export function customerSitePath(slug:string,section=''){return '/customer/sites/'+encodeURIComponent(slug)+(section?'/'+section:'');}
export function customerSwitchPath(currentSlug:string,pathname:string,nextSlug:string){const section=pathname.slice(customerSitePath(currentSlug).length).split('/')[1]??'';return customerSitePath(nextSlug,section==='preview'?'website':customerSections.some(([key])=>key===section)?section:'');}
export const customerSections=[['','ダッシュボード'],['edit','ホームページ編集'],['website','ホームページ確認'],['contract','契約情報'],['payments','お支払い'],['support','お問い合わせ'],['account','アカウント設定']] as const;
