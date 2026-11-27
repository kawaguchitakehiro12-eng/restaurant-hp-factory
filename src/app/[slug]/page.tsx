import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDemoSiteRepository } from "@/lib/repositories";
import { isPublicSiteVisible } from "@/lib/stores/site-visibility";
import { resolveDemoStore } from "@/lib/stores/demo-content-resolver";
import { PublicStoreView } from "@/components/public/PublicStoreView";
export const dynamic="force-dynamic";
type Props={params:Promise<{slug:string}>};
async function visibleSite(slug:string){const site=await getDemoSiteRepository().findBySlug(slug);if(!site||!isPublicSiteVisible(site))notFound();return site;}
export async function generateMetadata({params}:Props):Promise<Metadata>{const site=await visibleSite((await params).slug);return {title:site.storeName,description:site.content?.basicInfo.concept,robots:{index:true,follow:true}};}
export default async function Page({params}:Props){const {slug}=await params;const site=await visibleSite(slug);return <PublicStoreView isDemo={false} resolution={{status:"found",...resolveDemoStore(site)}} canonicalPath={'/'+encodeURIComponent(slug)} />;}
