import Link from 'next/link';
import {notFound} from 'next/navigation';
import {requireCustomerUser,getCustomerSite} from '@/lib/customer/server';
import {customerAccess,customerSitePath} from '@/lib/customer/access';
import {CustomerSiteEditor} from '@/components/customer/CustomerSiteEditor';
import {CustomerCommerceSection} from '@/components/customer/CustomerCommerceSection';
export default async function Page({params}:{params:Promise<{slug:string;section:string}>}){
 const user=await requireCustomerUser(),{slug,section}=await params,site=await getCustomerSite(user.id,slug),a=customerAccess(site);
 if(section==='edit')return a.edit?<CustomerSiteEditor key={site.id} initial={site}/>:<><h1>ホームページ編集</h1><p role="alert">契約終了後、または契約状態を確認できない場合は編集できません。</p></>;
 if(section==='website')return <><h1>ホームページ確認</h1><section className="admin-card"><h2>保存済み内容</h2>{a.preview?<Link href={customerSitePath(slug,'preview')} target="_blank" rel="noopener noreferrer">プレビューを開く</Link>:<p>契約終了後はプレビュー・公開できません。</p>}<h2>外部公開</h2>{a.external?<Link href={'/'+encodeURIComponent(slug)} target="_blank" rel="noopener noreferrer">公開URLを開く</Link>:<p>現在は外部公開されていません。</p>}<p>独自ドメインは取得・DNS・証明書設定の完了後に利用できます。</p></section>{a.edit&&<CustomerCommerceSection key={site.id} siteId={site.id} section="website"/>}</>;
 if(section==='account')return <><h1>アカウント設定</h1><section className="admin-card"><p>ログイン情報は管理するすべての店舗で共通です。</p><Link href="/customer/password">パスワードを変更</Link><p>カード番号・セキュリティコードをお問い合わせに入力しないでください。</p></section></>;
 if(section==='contract'||section==='payments'||section==='support')return <CustomerCommerceSection key={site.id+section} siteId={site.id} section={section}/>;
 notFound();
}
