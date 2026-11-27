'use client';
import {useState,useRef} from 'react';
import {browserApiFetch} from '@/lib/browser/api-fetch';
type Job={id:string;state:string;revision:number};
export function MediaMigrationPanel({site}:{site:string}){const [jobs,setJobs]=useState<Job[]>([]),[message,setMessage]=useState(''),[busy,setBusy]=useState(false),flight=useRef(false);if(process.env.NEXT_PUBLIC_MEDIA_UPLOAD_ENABLED!=='development')return null;
 const endpoint=`/api/admin/media/${encodeURIComponent(site)}/migration`;
 async function inspect(){const r=await browserApiFetch(endpoint,{cache:'no-store'});if(!r.ok)throw Error();const body=await r.json() as {jobs:Job[]};setJobs(body.jobs);}
 async function act(action:'start'|'resume',jobId?:string){if(flight.current||!window.confirm('検証環境の画像移行を実行します。旧画像の暗号化保全を確認し、既存画像は削除しません。続けますか？'))return;flight.current=true;setBusy(true);try{const r=await browserApiFetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,jobId})});setMessage(r.ok?'処理結果を台帳で確認してください。':'結果不明または停止しました。自動再実行せず、台帳を確認してください。');await inspect();}catch{setMessage('結果を確認できません。再送せず台帳を確認してください。');}finally{setBusy(false);flight.current=false;}}
 return <section className="admin-card"><h2>画像移行（開発検証専用）</h2><p>旧画像は暗号化して保全します。既存画像の自動削除は行いません。</p><button disabled={busy} onClick={()=>void act('start')}>移行を開始</button><button disabled={busy} onClick={()=>void inspect().catch(()=>setMessage('台帳を確認できません。'))}>台帳を読み直す</button><p role="status">{message}</p>{jobs.map(j=><div key={j.id}><span>{j.id.slice(0,8)}：{j.state}</span>{['planned','prepared','review'].includes(j.state)&&<button disabled={busy} onClick={()=>void act('resume',j.id)}>状態確認後に再開</button>}</div>)}</section>;
}
