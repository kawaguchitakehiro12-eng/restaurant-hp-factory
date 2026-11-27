import {MediaPreviewRefresh} from '@/components/customer/MediaPreviewRefresh';
import {authorizedMediaDisplay} from '@/lib/media/authorized-display';
import { notFound, redirect } from "next/navigation";
import { getOperatorAuth } from "@/lib/auth/operator";
import { getDemoSiteRepository } from "@/lib/repositories";
import { isSharedSiteVisible } from "@/lib/stores/site-visibility";
import { resolveDemoStore } from "@/lib/stores/demo-content-resolver";
import { PublicStoreView } from "@/components/public/PublicStoreView";
export const dynamic = "force-dynamic";
export const metadata = { robots:{index:false,follow:false},referrer:"no-referrer" as const };
export default async function Preview({params}:{params:Promise<{slug:string}>}) {
  const auth=await getOperatorAuth();if(auth.status==="unavailable")return <main role="alert">認証サービスに接続できません。時間をおいて再読み込みしてください。</main>;if(auth.status!=="ok")redirect("/login");
  const {slug}=await params;const site=await getDemoSiteRepository().findBySlug(slug);
  if(!site||!isSharedSiteVisible(site))notFound();
  const resolution={status:"found" as const,...resolveDemoStore(site)};
  return <><MediaPreviewRefresh/><PublicStoreView resolution={await authorizedMediaDisplay(resolution,site.id,'edit')} canonicalPath={`/admin/demo/${encodeURIComponent(slug)}/preview`} topBanner={<p>運営者専用プレビューです。先方には共有画面で発行したURLを送付してください。</p>} /></>;
}
