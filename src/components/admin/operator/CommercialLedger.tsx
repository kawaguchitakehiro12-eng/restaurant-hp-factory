"use client";
import {useCallback,useEffect,useRef,useState} from "react";
import Link from "next/link";
import type {DemoSite} from "@/types/demo";
import type {CommercialTerms,ManualInvoice,InvoiceKind,InvoiceStatus} from "@/lib/commercial/model";
import {nextMonth,overdue} from "@/lib/commercial/model";
import {browserApiFetch,apiErrorMessage,readApiJson} from "@/lib/browser/api-fetch";
import {installUnsavedChangesGuard} from "@/lib/browser/unsaved-changes";
import {throwIfAuthError} from "@/lib/data/api-errors";
import {useOperatorAdmin} from "@/components/admin/operator/OperatorAdminProvider";
import {formatCurrency} from "@/lib/admin/labels";
const labels:Record<InvoiceStatus,string>={draft:'下書き',issued:'外部で請求済み',paid:'入金確認済み',void:'取消済み'};
const today=()=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Tokyo'}).format(new Date());
export function CommercialLedger({site}:{site:DemoSite}){
 const{reportAuthError}=useOperatorAdmin();
 const [invoices,setInvoices]=useState<ManualInvoice[]>([]),[terms,setTerms]=useState<CommercialTerms|null>(null),[ready,setReady]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[message,setMessage]=useState('');
 const [period,setPeriod]=useState(today().slice(0,7)),[kind,setKind]=useState<InvoiceKind>('monthly'),[amount,setAmount]=useState(String(site.monthlyFee??0)),[due,setDue]=useState(today()),[paidOn,setPaidOn]=useState(today());
 const [initialFee,setInitialFee]=useState('0'),[renewal,setRenewal]=useState(''),[cancellation,setCancellation]=useState(''),[notes,setNotes]=useState('');
 const invoiceId=useRef<string|null>(null),dirty=useRef({invoice:false,terms:false});
 useEffect(()=>installUnsavedChangesGuard(()=>dirty.current.invoice||dirty.current.terms||busy),[busy]);
 const read=useCallback(async()=>{const response=await browserApiFetch('/api/admin/commercial?siteId='+encodeURIComponent(site.id),{cache:'no-store'});throwIfAuthError(response);const body=await readApiJson<{invoices:ManualInvoice[];terms:CommercialTerms|null;error?:string}>(response);if(!response.ok)throw new Error(apiErrorMessage(body,response.status));return body;},[site.id]);
 const applyData=useCallback((body:{invoices:ManualInvoice[];terms:CommercialTerms|null})=>{setInvoices(body.invoices);if(!dirty.current.terms){setTerms(body.terms);setInitialFee(String(body.terms?.initial_fee_yen??0));setRenewal(body.terms?.renewal_on??'');setCancellation(body.terms?.cancellation_on??'');setNotes(body.terms?.notes??'');}setReady(true);},[]);
 useEffect(()=>{let active=true;read().then(body=>{if(active)applyData(body)}).catch(e=>{if(active){reportAuthError(e);setError(e instanceof Error?e.message:'請求情報を取得できません。');}});return()=>{active=false}},[read,applyData,reportAuthError]);
 async function send(action:string,data:unknown){const response=await browserApiFetch('/api/admin/commercial',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,data})});throwIfAuthError(response);const body=await readApiJson<ManualInvoice|CommercialTerms>(response);if(!response.ok)throw new Error(apiErrorMessage(body,response.status));return body;}
 async function task(fn:()=>Promise<void>){if(busy)return;setBusy(true);setError('');setMessage('');try{await fn()}catch(e){reportAuthError(e);setError(e instanceof Error?e.message:'保存できませんでした。入力を保持しています。')}finally{setBusy(false)}}
 async function create(){await task(async()=>{invoiceId.current??=crypto.randomUUID();const saved=await send('create',{id:invoiceId.current,site_id:site.id,kind,period,amount_yen:amount.trim()===''?null:Number(amount),due_on:due}) as ManualInvoice;setInvoices(rows=>[saved,...rows.filter(r=>r.id!==saved.id)]);invoiceId.current=null;dirty.current.invoice=false;setMessage(saved.status==='draft'?'下書きを保存しました。請求書の送信・決済は行っていません。':'既存の請求記録を確認しました（'+labels[saved.status]+'）。請求書の送信・決済は行っていません。');});}
 async function saveTerms(){await task(async()=>{const saved=await send('terms',{site_id:site.id,initial_fee_yen:initialFee.trim()===''?null:Number(initialFee),renewal_on:renewal||null,cancellation_on:cancellation||null,notes,expected_revision:terms?.revision??null}) as CommercialTerms;setTerms(saved);dirty.current.terms=false;setMessage('契約補足を保存しました。公開停止や請求の自動処理は行いません。');});}
 async function transition(row:ManualInvoice,status:InvoiceStatus){if(!window.confirm(`${site.storeName} / ${row.period} / ${formatCurrency(row.amount_yen)}\n「${labels[status]}」として記録しますか？\n送信・決済・返金は実行しません。入金済みへの変更は元に戻せません。`))return;await task(async()=>{const saved=await send('transition',{id:row.id,expected_revision:row.revision,status,paid_on:status==='paid'?paidOn:null}) as ManualInvoice;setInvoices(rows=>rows.map(r=>r.id===saved.id?saved:r));setMessage('状態を記録しました。外部送信・決済は行っていません。');});}
 function editInvoice(){setMessage('請求下書きに未保存の変更があります。');dirty.current.invoice=true;invoiceId.current=null;}
 const open=invoices.filter(r=>r.status==='issued'),late=open.filter(r=>overdue(r,today()));
 return <section className="admin-edit-section commercial-ledger" aria-label="手動請求台帳" aria-busy={busy}><h2>手動請求台帳：{site.storeName}</h2>
 <p>請求書の作成・送付・銀行口座の確認は外部で行い、ここには税込総額と結果を記録します。自動課金・メール送信・自動公開停止は行いません。</p>
 {busy?<p role="status">保存・確認を行っています…</p>:null}{error?<p role="alert">{error}</p>:null}{message?<p role="status">{message}</p>:null}
 <button className="admin-btn admin-btn--secondary" type="button" disabled={busy} onClick={()=>void task(async()=>{applyData(await read());setMessage('最新の台帳を取得しました。入力中の内容は保持しています。')})}>台帳を再読込</button>
 <p>未入金 {open.length}件・{formatCurrency(open.reduce((s,r)=>s+r.amount_yen,0))} ／ 支払期限超過 {late.length}件</p>
 {terms?.cancellation_on?<p role="alert">解約日 {terms.cancellation_on} を記録済みです。解約月より後の請求は登録できません。既存請求の取消・精算と<Link href="/admin/sites">公開停止</Link>は別途確認してください。</p>:null}
 <form onSubmit={e=>{e.preventDefault();void saveTerms()}}><fieldset disabled={!ready||busy}><legend>契約補足情報</legend><div className="admin-form-grid">
 <label className="admin-form-label">初期費用（税込・円）<input className="admin-form-input" type="number" min="0" max="999999999" required value={initialFee} onChange={e=>{dirty.current.terms=true;setMessage('契約補足に未保存の変更があります。');setInitialFee(e.target.value)}}/></label>
 <label className="admin-form-label">次回契約更新日<input className="admin-form-input" type="date" value={renewal} onChange={e=>{dirty.current.terms=true;setMessage('契約補足に未保存の変更があります。');setRenewal(e.target.value)}}/></label>
 <label className="admin-form-label">合意済みの解約日<input className="admin-form-input" type="date" value={cancellation} onChange={e=>{dirty.current.terms=true;setMessage('契約補足に未保存の変更があります。');setCancellation(e.target.value)}}/></label>
 <label className="admin-form-label">申込・契約内容のメモ（2000文字以内）<textarea className="admin-form-input" rows={4} maxLength={2000} value={notes} onChange={e=>{dirty.current.terms=true;setMessage('契約補足に未保存の変更があります。');setNotes(e.target.value)}}/></label></div><button className="admin-btn admin-btn--primary" type="submit">契約補足を保存</button> <button className="admin-btn admin-btn--secondary" type="button" onClick={()=>{if(window.confirm("契約補足の未保存入力を破棄して最新の内容を取得しますか？")){dirty.current.terms=false;void task(async()=>{applyData(await read())})}}}>契約補足の入力を破棄して再取得</button></fieldset></form>
 <form onSubmit={e=>{e.preventDefault();void create()}}><fieldset disabled={!ready||busy}><legend>請求下書きを登録</legend><div className="admin-form-grid">
 <label className="admin-form-label">費目<select className="admin-form-input" value={kind} onChange={e=>{editInvoice();setKind(e.target.value as InvoiceKind);setAmount(e.target.value==='initial'?initialFee:String(site.monthlyFee??0))}}><option value="monthly">月額利用料</option><option value="initial">初期費用</option></select></label>
 <label className="admin-form-label">対象月<input className="admin-form-input" type="month" required value={period} onChange={e=>{editInvoice();setPeriod(e.target.value)}}/></label>
 <label className="admin-form-label">請求総額（税込・円）<input className="admin-form-input" type="number" min="0" max="999999999" required value={amount} onChange={e=>{editInvoice();setAmount(e.target.value)}}/></label>
 <label className="admin-form-label">支払期限<input className="admin-form-input" type="date" required value={due} onChange={e=>{editInvoice();setDue(e.target.value)}}/></label></div>
 <button className="admin-btn admin-btn--primary" type="submit">請求下書きを保存</button> <button className="admin-btn admin-btn--secondary" type="button" disabled={!/^20\d{2}-(0[1-9]|1[0-2])$/.test(period)} onClick={()=>{editInvoice();setPeriod(nextMonth(period))}}>対象月を翌月へ進める</button><p>翌月へ進めた場合は支払期限も確認してください。同じ費目・対象月の二重登録を防ぎます。誤入力は取消して新しい下書きを作成してください。通信失敗時は再読込して登録結果を確認してください。</p></fieldset></form>
 <label className="admin-form-label">入金確認日<input className="admin-form-input" type="date" value={paidOn} max={today()} onChange={e=>setPaidOn(e.target.value)}/></label>
 <p>幅が狭い画面では、請求一覧を左右にスクロールして記録操作を確認できます。</p><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>識別番号 / 対象月</th><th>費目 / 税込総額</th><th>支払期限</th><th>状態 / 入金日</th><th>記録操作</th></tr></thead><tbody>{invoices.map(r=><tr key={r.id}><td>{r.id}<br/>{r.period}</td><td>{r.kind==='initial'?'初期費用':'月額利用料'}<br/>{formatCurrency(r.amount_yen)}</td><td>{r.due_on}{overdue(r,today())?'（期限超過）':''}</td><td>{labels[r.status]}{r.paid_on?<><br/>{r.paid_on}</>:null}</td><td>{r.status==='draft'?<button className="admin-btn admin-btn--secondary" disabled={busy} onClick={()=>void transition(r,'issued')}>外部で請求済みにする</button>:null}{r.status==='issued'?<button className="admin-btn admin-btn--primary" disabled={busy} onClick={()=>void transition(r,'paid')}>入金確認済みにする</button>:null}{['draft','issued'].includes(r.status)?<button className="admin-btn admin-btn--danger" disabled={busy} onClick={()=>void transition(r,'void')}>取消を記録</button>:null}</td></tr>)}</tbody></table></div>{ready&&invoices.length===0?<p>請求記録はありません。</p>:null}
 </section>;
}
