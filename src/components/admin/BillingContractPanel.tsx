import Link from "next/link";
import {formatDate} from "@/lib/admin/labels";
import type {StoreSubscription} from "@/types/admin";
/** Manual operations only. Never simulates sent email, verification or scheduled work. */
export function BillingContractPanel({subscription,contactEmail}:{subscription:StoreSubscription;contactEmail:string}) {
 return <section className="admin-card admin-contract-card" aria-label="契約の手動対応案内">
  <h2 className="admin-contract-card-title">契約更新・解約のお手続き</h2>
  <p>この画面から確認メールは送信されません。通知予約・メール認証・自動解約・自動公開停止は行いません。</p>
  <dl className="admin-contract-card-meta"><div><dt>登録された最低利用期間終了日（参考）</dt><dd>{formatDate(subscription.minimumTermEndDate)}</dd></div>{contactEmail?<div><dt>登録連絡先（参考）</dt><dd>{contactEmail}</dd></div>:null}</dl>
  <p>正式な契約内容と相手のご意向を確認し、合意した日付・対応履歴を運営担当者が記録します。請求や精算は外部の手段で確認し、公開停止は別途実施してください。</p>
  <p>契約・入金状態や過去の通知予約の表示だけを、実際の配送・入金・処理完了の証拠にしないでください。</p>
  <Link href="/admin/billing" className="admin-btn admin-btn--secondary">運営用の契約・請求管理で確認</Link>
 </section>;
}
