import {requireCustomerUser,listCustomerSites,getCustomerSite} from '@/lib/customer/server';
import {CustomerSiteNavigation} from '@/components/customer/CustomerSiteNavigation';
export default async function Layout({children,params}:{children:React.ReactNode;params:Promise<{slug:string}>}){const user=await requireCustomerUser(),site=await getCustomerSite(user.id,(await params).slug),sites=await listCustomerSites(user.id);return <><CustomerSiteNavigation selected={site} sites={sites.map(({id,slug,name})=>({id,slug,name}))}/>{children}</>}
