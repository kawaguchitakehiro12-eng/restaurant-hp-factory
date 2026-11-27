import type {CustomerSite} from "@/types/customer-site";
export function CustomerBillingSummary({site}:{site:CustomerSite}) {
 const currency=site.monthlyFee===null?'未設定':new Intl.NumberFormat('ja-JP',{style:'currency',currency:'JPY',maximumFractionDigits:0}).format(site.monthlyFee);
 const state=({paid:'入金済み',unpaid:'未入金',overdue:'支払期限超過',pending:'請求準備中'} as Record<string,string>)[site.billingStatus??'']??'未設定';
 return <section className="admin-card"><h2>契約・請求情報</h2><p className="customer-notice">以下は契約時の登録情報です。現在の請求額・送付状況・入金結果を示すものではありません。最新の請求書・入金確認は運営窓口へお問い合わせください。</p><dl className="customer-billing">{[['登録月額料金',currency],['契約開始日',site.contractStartDate],['登録された最低利用期間終了日',site.minimumTermEndDate],['契約時の次回請求予定',site.nextBillingDate],['契約時の請求状態（参考）',state]].map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value??'未設定'}</dd></div>)}</dl><p>この画面から自動課金・解約予約・公開停止は行いません。契約変更・解約のご希望は運営窓口へご連絡ください。</p></section>;
}
