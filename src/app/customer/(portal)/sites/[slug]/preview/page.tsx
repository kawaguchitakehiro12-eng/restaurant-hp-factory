import {MediaPreviewRefresh} from '@/components/customer/MediaPreviewRefresh';
import {notFound} from 'next/navigation';
import {requireCustomerUser,getCustomerSite} from '@/lib/customer/server';
import {getDemoSiteRepository} from '@/lib/repositories';
import {resolveDemoStore} from '@/lib/stores/demo-content-resolver';
import {PublicStoreView} from '@/components/public/PublicStoreView';
import {authorizedMediaDisplay} from '@/lib/media/authorized-display';
export const dynamic='force-dynamic';
export const metadata={robots:{index:false,follow:false},referrer:'no-referrer' as const};
export default async function Preview({params}:{params:Promise<{slug:string}>}){const user=await requireCustomerUser(),slug=(await params).slug,owned=await getCustomerSite(user.id,slug),site=await getDemoSiteRepository().findBySlug(slug);if(!site||site.id!==owned.id)notFound();const resolution={status:'found' as const,...resolveDemoStore(site)};return <><MediaPreviewRefresh/><PublicStoreView resolution={await authorizedMediaDisplay(resolution,site.id,'edit')} canonicalPath={`/customer/sites/${encodeURIComponent(slug)}/preview`} topBanner={<p>ログイン中の店舗の保存済み内容です。公開状態は変更しません。</p>} /></>;}
