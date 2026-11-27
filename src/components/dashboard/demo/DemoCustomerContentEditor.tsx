"use client";
import {CustomerSiteEditor} from '@/components/customer/CustomerSiteEditor';
import {useDemoCustomer} from './DemoCustomerProvider';
import {ensureDemoContent} from '@/types/demo-content';
import type {DemoSite} from '@/types/demo';
import type {CustomerSite} from '@/types/customer-site';
function editableSite(site:DemoSite):CustomerSite{const {basicInfo,photos,menus,topics}=ensureDemoContent(site.content);return{id:site.id,slug:site.storeSlug,name:site.storeName,publishStatus:site.publishStatus,contractStatus:site.siteContractStatus,monthlyFee:site.monthlyFee??null,contractStartDate:site.contractStartDate??null,minimumTermEndDate:site.minimumTermEndDate??null,nextBillingDate:site.nextBillingDate??null,billingStatus:site.billingStatus??null,revision:site.contentRevision??null,content:{basicInfo,photos,menus,topics}};}
/** Operator-only customer-view route. Persist through the existing operator-authorized API. */
export function DemoCustomerContentEditor({tab}:{tab:'basic'|'menus'|'photos'|'topics'}){const {demo,saveContent}=useDemoCustomer();return <CustomerSiteEditor key={demo.id+tab} initial={editableSite(demo)} initialTab={tab} persist={async(content,revision)=>editableSite(await saveContent(content,revision))}/>;}
