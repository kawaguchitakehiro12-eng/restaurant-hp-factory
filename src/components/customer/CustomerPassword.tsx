"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
export function CustomerPassword({recover=false,initialError=""}:{recover?:boolean;initialError?:string}) {
 const [email,setEmail]=useState(""),[password,setPassword]=useState(""),[confirm,setConfirm]=useState(""),[busy,setBusy]=useState(false),[message,setMessage]=useState(""),[error,setError]=useState(initialError);
 async function submit(event:FormEvent) {
  event.preventDefault();if(busy)return;setBusy(true);setError("");setMessage("");
  try {
   const client=createBrowserSupabaseClient();
   if(recover){const {error}=await client.auth.resetPasswordForEmail(email.trim(),{redirectTo:window.location.origin+"/customer/auth/callback"});if(error){setError("送信を受け付けられませんでした。時間をおいて再度お試しください。");return;}setMessage("登録がある場合は、再設定メールの送信を受け付けました。届かない場合は迷惑メールをご確認のうえ、運営へお問い合わせください。");}
   else {if(password.length<12||password!==confirm){setError("12文字以上の同じパスワードを2回入力してください。");return;}const {error}=await client.auth.updateUser({password});if(error){setError("変更できませんでした。リンクの期限やログイン状態を確認してください。");return;}window.location.assign("/customer");}
  }catch{setError("接続できません。時間をおいて再度お試しください。");}finally{setBusy(false);}
 }
 return <div className="admin-root admin-login-page"><main className="admin-login-card"><h1 className="admin-login-title">{recover?"パスワードの再設定":"パスワードを設定"}</h1><form className="admin-login-form" onSubmit={submit}>
  {recover?<label>登録メールアドレス<input className="admin-form-input" type="email" required autoComplete="username" value={email} onChange={e=>setEmail(e.target.value)}/></label>:<><label>新しいパスワード（12文字以上）<input className="admin-form-input" type="password" required minLength={12} autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)}/></label><label>確認用パスワード<input className="admin-form-input" type="password" required minLength={12} autoComplete="new-password" value={confirm} onChange={e=>setConfirm(e.target.value)}/></label></>}
  {error&&<p role="alert" className="admin-form-error">{error}</p>}{message&&<p role="status">{message}</p>}<button className="admin-btn admin-btn--primary" disabled={busy}>{busy?"処理中…":recover?"再設定メールを送る":"設定する"}</button>
 </form><Link href="/customer/login" className="admin-btn admin-btn--ghost">ログインに戻る</Link></main></div>;
}
