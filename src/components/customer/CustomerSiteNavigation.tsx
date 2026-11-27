"use client";
import Link from 'next/link';
import {LayoutDashboard,FilePenLine,Monitor,FileCheck2,CreditCard,MessagesSquare,Settings} from 'lucide-react';
import {usePathname,useRouter} from 'next/navigation';
import {confirmBeforeLeaving} from '@/lib/browser/unsaved-changes';
import {customerSections,customerSitePath,customerSwitchPath,customerAccess} from '@/lib/customer/access';
import type {CustomerSite} from '@/types/customer-site';
export function CustomerSiteNavigation({sites,selected}:{sites:Pick<CustomerSite,'id'|'slug'|'name'>[];selected:CustomerSite}){
 const icons=[LayoutDashboard,FilePenLine,Monitor,FileCheck2,CreditCard,MessagesSquare,Settings];
 const pathname=usePathname(),router=useRouter(),a=customerAccess(selected);
 return <><div className="customer-store-switch"><label>管理する店舗<select value={selected.slug} onChange={e=>{if(!confirmBeforeLeaving())return;router.push(customerSwitchPath(selected.slug,pathname,e.target.value));}}>{sites.map(s=><option key={s.id} value={s.slug}>{s.name}</option>)}</select></label></div><nav className="customer-portal-nav" aria-label="店舗管理">{customerSections.filter(([section])=>section!=='edit'||a.edit).map(([section,label])=>{const href=customerSitePath(selected.slug,section);const Icon=icons[customerSections.findIndex(([key])=>key===section)];return <Link key={label} href={href} aria-current={pathname===href?'page':undefined}><Icon size={18} aria-hidden="true"/><span>{label}</span></Link>})}</nav></>;
}
