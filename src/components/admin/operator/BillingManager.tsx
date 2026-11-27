"use client";
import {CommercialLedger} from "@/components/admin/operator/CommercialLedger";
import {confirmBeforeLeaving} from "@/lib/browser/unsaved-changes";
import {useState} from "react";
import Link from "next/link";
import {PageHeader} from "@/components/admin/PageHeader";
import {StatCard} from "@/components/admin/StatCard";
import {useOperatorAdmin} from "@/components/admin/operator/OperatorAdminProvider";
import {matchesSearch} from "@/lib/admin/search";
import {formatCurrency,formatDate} from "@/lib/admin/labels";
export function BillingManager(){
 const {demoSites,customers,hydrated}=useOperatorAdmin(),[query,setQuery]=useState(""),[selected,setSelected]=useState("");
 const contracts=demoSites.filter(s=>Boolean(s.customerId)&&s.siteContractStatus!=="demo"),rows=contracts.filter(s=>matchesSearch(query,[s.storeName,s.storeSlug,customers.find(c=>c.id===s.customerId)?.name]));
 const total=contracts.reduce((sum,s)=>sum+(s.monthlyFee??0),0);
 return <><PageHeader title="契約・請求管理" description="店舗の契約に登録された情報です。自動課金・請求書送信は行いません。初期運用は外部の手動台帳で請求・入金を確認します。アプリ内台帳は別途有効化した環境でのみ利用できます。"/><div className="admin-stat-grid"><StatCard label="登録契約数" value={contracts.length}/><StatCard label="登録月額の合計" value={formatCurrency(total)} hint="入金実績や今月の請求確定額ではありません"/></div>
 <label className="admin-form-label">契約を検索<input type="search" className="admin-form-input" value={query} onChange={e=>setQuery(e.target.value)} placeholder="店舗名・顧客名・URL名"/></label>
 <p>上段は契約登録時の参考情報です。現在の請求・入金状況は運営で使用する外部台帳で確認してください。アプリ内台帳を有効化済みの場合は下の店舗別台帳も利用できます。</p><p role="status">{hydrated?rows.length+"件":"読み込み中…"}</p><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>店舗 / 顧客</th><th>月額</th><th>契約開始</th><th>最低利用期間終了</th><th>契約時の請求予定</th><th>契約時の請求状態</th><th>公開状態</th></tr></thead><tbody>{rows.map(s=><tr key={s.id}><td><Link href={"/admin/demo/"+encodeURIComponent(s.storeSlug)+"/edit"}>{s.storeName}</Link><br/>{customers.find(c=>c.id===s.customerId)?.name??"顧客情報を確認してください"}</td><td>{s.monthlyFee==null?"未設定":formatCurrency(s.monthlyFee)}</td><td>{s.contractStartDate?formatDate(s.contractStartDate):"未設定"}</td><td>{s.minimumTermEndDate?formatDate(s.minimumTermEndDate):"未設定"}</td><td>{s.nextBillingDate?formatDate(s.nextBillingDate):"未設定"}</td><td>{({paid:"入金済み",unpaid:"未入金",overdue:"支払期限超過",pending:"請求準備中"} as Record<string,string>)[s.billingStatus??""]??"未設定"}</td><td>{s.publishStatus==="suspended"?"停止中":s.siteContractStatus==="contracted"&&s.publishStatus==="published"?"公開中":"非公開"}</td></tr>)}</tbody></table></div>{hydrated&&rows.length===0?<p>条件に合う契約がありません。店舗の契約状態を確認してください。</p>:null}<label className="admin-form-label">アプリ内台帳（有効化済みの場合）<select className="admin-form-input" value={selected} onChange={e=>{if(confirmBeforeLeaving())setSelected(e.target.value)}}><option value="">店舗を選択してください</option>{contracts.filter(s=>["contracted","suspended"].includes(s.siteContractStatus)).map(s=><option key={s.id} value={s.id}>{s.storeName} / {customers.find(c=>c.id===s.customerId)?.name??"顧客未確認"}</option>)}</select></label>{selected&&contracts.find(s=>s.id===selected)?<CommercialLedger key={selected} site={contracts.find(s=>s.id===selected)!}/>:null}</>;
}
