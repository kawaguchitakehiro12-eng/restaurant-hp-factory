"use client";
import {useMemo,useState} from "react";
import Link from "next/link";
import {PageHeader} from "@/components/admin/PageHeader";
import {useOperatorAdmin} from "@/components/admin/operator/OperatorAdminProvider";
import {matchesSearch} from "@/lib/admin/search";
import {formatDate} from "@/lib/admin/labels";
export function CustomersManager(){
 const {customers,demoSites,hydrated}=useOperatorAdmin();const[query,setQuery]=useState(""),[page,setPage]=useState(1);
 const filtered=useMemo(()=>customers.filter(c=>matchesSearch(query,[c.name,c.contactEmail,c.contactPhone,c.contactPersonName])),[customers,query]);
 const pages=Math.max(1,Math.ceil(filtered.length/25)),current=Math.min(page,pages),visible=filtered.slice((current-1)*25,current*25);
 return <><PageHeader title="顧客一覧" description="契約時に登録された顧客と店舗を確認できます。顧客の新規登録は店舗の契約手続きから行います。"/>
 <label className="admin-form-label">顧客を検索<input type="search" className="admin-form-input" value={query} placeholder="顧客名・メール・電話番号" onChange={e=>{setQuery(e.target.value);setPage(1)}}/></label>
 <p role="status" className="admin-form-hint">{hydrated?filtered.length+"件 / 全"+customers.length+"件":"読み込み中…"}</p>
 {hydrated&&filtered.length===0?<p>条件に合う顧客がいません。検索語を短くするか、店舗の契約状態を確認してください。</p>:null}
 <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>顧客名</th><th>メール</th><th>電話番号</th><th>登録日</th><th>契約店舗</th></tr></thead><tbody>{visible.map(c=><tr key={c.id}><td>{c.name}<br/><small>{c.id}</small></td><td>{c.contactEmail||"未登録"}</td><td>{c.contactPhone||"未登録"}</td><td>{formatDate(c.createdAt)}</td><td>{demoSites.filter(s=>s.customerId===c.id).map(site=><div key={site.id}><Link href={"/admin/demo/"+encodeURIComponent(site.storeSlug)+"/edit"}>{site.storeName}</Link></div>)}</td></tr>)}</tbody></table></div>
 <div className="admin-pagination"><button className="admin-btn admin-btn--secondary" disabled={current<=1} onClick={()=>setPage(current-1)}>前の25件</button><span>{current}/{pages}</span><button className="admin-btn admin-btn--secondary" disabled={current>=pages} onClick={()=>setPage(current+1)}>次の25件</button></div></>;
}
