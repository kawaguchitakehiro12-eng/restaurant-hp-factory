"use client";
import {browserApiFetch,apiErrorMessage,readApiJson} from "@/lib/browser/api-fetch";
import {useEffect,useRef,useState} from "react";
import {installUnsavedChangesGuard} from "@/lib/browser/unsaved-changes";
import Link from "next/link";
import {MediaUploadContext} from './MediaUploadContext';
import {LogoUpload} from '@/components/customer/LogoUpload';
import {ImageUploadField} from "@/components/admin/ImageUploadField";
import {serializeSaveBody} from "@/lib/data/json-body";
import {CustomerBillingSummary} from "@/components/customer/CustomerBillingSummary";
import {parseCustomerSaveResponse} from "@/lib/customer/save-response";
import {parseCustomerContent} from "@/lib/customer/validation";
import type {CustomerContent,CustomerSite} from "@/types/customer-site";
import type {DemoBasicInfo} from "@/types/demo-content";

const fields:[keyof Omit<DemoBasicInfo,"subCopyLines">,string][]=[
 ["nameEn","店舗名（英字）"],["catchCopy","キャッチコピー"],["subCopy","サブコピー"],["concept","コンセプト"],
 ["address","住所"],["phone","電話番号"],["businessHours","営業時間"],["weekdayHours","平日の営業時間"],["weekendHours","土日祝の営業時間"],
 ["closedDays","定休日"],["access","アクセス"],["mapEmbedUrl","Googleマップ埋め込みURL"],["instagramUrl","Instagram URL"],["reservationUrl","予約URL"]
];
const tabs=[['basic','店舗情報'],['menus','メニュー'],['photos','写真'],['topics','お知らせ'],['billing','契約・請求']] as const;
type Tab=typeof tabs[number][0];
export function CustomerSiteEditor({initial}:{initial:CustomerSite}) {
 const [site,setSite]=useState(initial),[draft,setDraft]=useState<CustomerContent>(initial.content),[tab,setTab]=useState<Tab>('basic');
 const [dirty,setDirty]=useState(false),[saving,setSaving]=useState(false),[message,setMessage]=useState(''),[error,setError]=useState(''),[conflict,setConflict]=useState(false),[expired,setExpired]=useState(false),[accessBlocked,setAccessBlocked]=useState(false);
 const discarding=useRef(false),inFlight=useRef(false),editorRef=useRef<HTMLFieldSetElement>(null);
 useEffect(()=>installUnsavedChangesGuard(()=>!discarding.current&&(dirty||saving)),[dirty,saving]);
 function edit(next:CustomerContent){setDraft(next);setDirty(true);setMessage('');setError('');}
 function basic(key:keyof DemoBasicInfo,value:string|string[]){edit({...draft,basicInfo:{...draft.basicInfo,[key]:value}});}
 async function save() {
  if(editorRef.current?.querySelector('[aria-busy="true"]')){setError("画像を処理しています。完了してから保存してください。");return;}
  if(inFlight.current||!dirty||conflict||accessBlocked)return;inFlight.current=true;setSaving(true);setError('');setMessage('');
  try {
   const content=parseCustomerContent(draft);
   const response=await browserApiFetch(`/api/customer/sites/${encodeURIComponent(site.slug)}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:serializeSaveBody({content,revision:site.revision})});
   if(response.status===401){setExpired(true);throw Error('ログインの有効期限が切れました。別タブでログインし直してから保存してください。');}
   if(response.status===403||response.status===404){setAccessBlocked(true);throw Error('店舗が公開停止中か、アクセス権が変更された可能性があります。入力内容を控えて運営へ確認してください。');}
   const body=await readApiJson<CustomerSite & {error?:string}>(response);
   if(response.status===409)setConflict(true);
   if(!response.ok)throw Error(apiErrorMessage(body,response.status));
   const updated=parseCustomerSaveResponse(body,site);setSite(updated);setDraft(updated.content);setDirty(false);setMessage('保存しました。サイトに反映されます。');
  }catch(error){setError(error instanceof Error?error.message:'保存できませんでした。時間をおいて再度お試しください。');}finally{inFlight.current=false;setSaving(false);}
 }
 function newId(){return crypto.randomUUID();}
 return <MediaUploadContext slug={site.slug}>
  <Link href="/customer">← 店舗一覧</Link>
  <div className="customer-title"><div><h1>{site.name}</h1><p className="customer-muted">店舗名・契約の変更は運営へご連絡ください。</p></div><a className="admin-btn admin-btn--secondary" href={process.env.NEXT_PUBLIC_MEDIA_UPLOAD_ENABLED==='development'?`/customer/sites/${encodeURIComponent(site.slug)}/preview`:`/${encodeURIComponent(site.slug)}`} target="_blank" rel="noopener noreferrer">保存済みのサイトを確認</a></div>
  <p className="customer-notice">① 編集する項目を選ぶ → ② 内容を変更 → ③「変更を保存」→ ④「サイトを確認」で保存済み内容を確認できます。</p>
  <nav className="customer-tabs" aria-label="編集する内容">{tabs.map(([key,label])=><button key={key} className={tab===key?'active':''} onClick={()=>setTab(key)} aria-current={tab===key?'page':undefined}>{label}</button>)}</nav>
  {error&&<div className="customer-notice customer-error" role="alert"><p>{error}</p>{expired&&<a href="/customer/login" target="_blank" rel="noopener noreferrer">別タブでログイン</a>}{accessBlocked&&<a href="/customer" target="_blank" rel="noopener noreferrer">別タブで利用可能な店舗を確認</a>}{conflict&&<button className="admin-btn admin-btn--secondary" onClick={()=>{if(window.confirm('未保存の変更を破棄して最新情報を読み込みますか？')){discarding.current=true;window.location.reload();}}}>最新情報を読み込む</button>}</div>}
  {message&&<div className="customer-notice" role="status">{message}</div>}
  <fieldset ref={editorRef} className="customer-editor" disabled={saving} aria-busy={saving}>
  {tab==='basic'&&<section className="admin-card"><h2>店舗基本情報</h2><LogoUpload value={draft.photos.logo??""} onChange={logo=>edit({...draft,photos:{...draft.photos,logo}})}/><div className="customer-form-grid">{fields.map(([key,label])=><label key={key} className="admin-form-label">{label}<textarea rows={['concept','subCopy'].includes(key)?3:1} className="admin-form-input" value={draft.basicInfo[key]} maxLength={['mapEmbedUrl','instagramUrl','reservationUrl'].includes(key)?2048:4000} onChange={e=>basic(key,e.target.value)}/></label>)}<label className="admin-form-label">サブコピーの改行表示（1行ずつ）<textarea className="admin-form-input" rows={3} value={draft.basicInfo.subCopyLines.join('\n')} onChange={e=>basic('subCopyLines',e.target.value.split('\n'))}/></label></div></section>}
  {tab==='menus'&&<section className="admin-card"><h2>メニュー</h2><p>非表示の項目はサイトに掲載されません。</p>{draft.menus.length===0&&<p>まだ登録されていません。メニューを追加してください。</p>}{draft.menus.map((item,index)=><div key={item.id} className="customer-item"><div className="customer-form-grid">{([['name','メニュー名'],['price','価格'],['description','説明']] as const).map(([key,label])=><label key={key}>{label}<input className="admin-form-input" value={item[key]} onChange={e=>edit({...draft,menus:draft.menus.map(x=>x.id===item.id?{...x,[key]:e.target.value}:x)})}/></label>)}</div><ImageUploadField label="メニュー写真" value={item.imageUrl} onChange={imageUrl=>edit({...draft,menus:draft.menus.map(x=>x.id===item.id?{...x,imageUrl}:x)})}/><div className="customer-item-actions"><label><input type="checkbox" checked={item.visible} onChange={e=>edit({...draft,menus:draft.menus.map(x=>x.id===item.id?{...x,visible:e.target.checked}:x)})}/> 表示する</label><button type="button" className="admin-btn admin-btn--ghost" disabled={index===0} onClick={()=>{const menus=[...draft.menus];[menus[index-1],menus[index]]=[menus[index],menus[index-1]];edit({...draft,menus:menus.map((x,i)=>({...x,sortOrder:i}))});}}>上へ</button><button type="button" className="admin-btn admin-btn--ghost" onClick={()=>{if(window.confirm('このメニューを削除しますか？保存するとサイトへ反映されます。'))edit({...draft,menus:draft.menus.filter(x=>x.id!==item.id)})}}>削除</button></div></div>)}<button type="button" className="admin-btn admin-btn--secondary" disabled={draft.menus.length>=100} onClick={()=>edit({...draft,menus:[...draft.menus,{id:newId(),name:'',price:'',description:'',imageUrl:'',visible:true,sortOrder:draft.menus.length}]})}>＋ メニューを追加</button></section>}
  {tab==='photos'&&<section className="admin-card"><h2>店舗の写真</h2><div className="customer-form-grid">{([['hero','メイン写真'],['interior','店内'],['food','料理'],['exterior','外観']] as const).map(([key,label])=><ImageUploadField key={key} label={label} value={draft.photos[key]} onChange={url=>edit({...draft,photos:{...draft.photos,[key]:url}})}/>)}</div><h3>ギャラリー</h3>{draft.photos.gallery.map(photo=><div className="customer-item" key={photo.id}><ImageUploadField label="ギャラリー写真" value={photo.url} onChange={url=>edit({...draft,photos:{...draft.photos,gallery:draft.photos.gallery.map(x=>x.id===photo.id?{...x,url}:x)}})}/><label>写真の説明<input className="admin-form-input" value={photo.caption} onChange={e=>edit({...draft,photos:{...draft.photos,gallery:draft.photos.gallery.map(x=>x.id===photo.id?{...x,caption:e.target.value,alt:e.target.value}:x)}})}/></label><button type="button" className="admin-btn admin-btn--ghost" onClick={()=>edit({...draft,photos:{...draft.photos,gallery:draft.photos.gallery.filter(x=>x.id!==photo.id)}})}>削除</button></div>)}<button type="button" className="admin-btn admin-btn--secondary" disabled={draft.photos.gallery.length>=40} onClick={()=>edit({...draft,photos:{...draft.photos,gallery:[...draft.photos.gallery,{id:newId(),url:'',alt:'',caption:'',sortOrder:draft.photos.gallery.length}]}})}>＋ ギャラリー写真を追加</button></section>}
  {tab==='topics'&&<section className="admin-card"><h2>お知らせ</h2>{draft.topics.length===0&&<p>まだ登録されていません。</p>}{draft.topics.map(item=><div key={item.id} className="customer-item">{([['title','タイトル'],['date','日付'],['body','本文']] as const).map(([key,label])=><label key={key}>{label}{key==='body'?<textarea className="admin-form-input" rows={4} value={item.body} onChange={e=>edit({...draft,topics:draft.topics.map(x=>x.id===item.id?{...x,body:e.target.value}:x)})}/>:<input type={key==='date'?'date':'text'} className="admin-form-input" value={item[key]} onChange={e=>edit({...draft,topics:draft.topics.map(x=>x.id===item.id?{...x,[key]:e.target.value}:x)})}/>}</label>)}<div className="customer-item-actions"><label><input type="checkbox" checked={item.visible} onChange={e=>edit({...draft,topics:draft.topics.map(x=>x.id===item.id?{...x,visible:e.target.checked}:x)})}/> 表示する</label><button type="button" className="admin-btn admin-btn--ghost" onClick={()=>{if(window.confirm('このお知らせを削除しますか？'))edit({...draft,topics:draft.topics.filter(x=>x.id!==item.id)})}}>削除</button></div></div>)}<button type="button" className="admin-btn admin-btn--secondary" disabled={draft.topics.length>=100} onClick={()=>edit({...draft,topics:[...draft.topics,{id:newId(),title:'',body:'',date:new Date().toLocaleDateString('sv-SE',{timeZone:'Asia/Tokyo'}),visible:true}]})}>＋ お知らせを追加</button></section>}
  {tab==='billing'&&<CustomerBillingSummary site={site}/>}
  </fieldset>
  <div className="customer-save"><span role="status">{saving?'保存しています…':dirty?'未保存の変更があります':'すべて保存済みです'}</span><button type="button" className="admin-btn admin-btn--primary" disabled={!dirty||saving||conflict||accessBlocked} onClick={()=>void save()}>{saving?'保存中…':'変更を保存'}</button></div>
 </MediaUploadContext>;
}
