import {notFound} from "next/navigation";
import {CustomerAccessError,getCustomerSite,requireCustomerUser} from "@/lib/customer/server";
import {CustomerSiteEditor} from "@/components/customer/CustomerSiteEditor";
export default async function Page({params}:{params:Promise<{slug:string}>}){const user=await requireCustomerUser();const site=await getCustomerSite(user.id,(await params).slug).catch(error=>{if(error instanceof CustomerAccessError&&error.status===404)notFound();throw error;});return <CustomerSiteEditor key={site.id} initial={site}/>;}
