"use client";
import {isAuthUnavailable} from "@/lib/browser/auth-fetch";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { SakupageLogo } from "@/components/admin/SakupageLogo";

export function CustomerLogin() {
 const [email,setEmail]=useState(""),[password,setPassword]=useState(""),[busy,setBusy]=useState(false),[error,setError]=useState("");
 async function submit(event:FormEvent) {
  event.preventDefault();if(busy)return;setBusy(true);setError("");
  try {
   const {error}=await createBrowserSupabaseClient().auth.signInWithPassword({email:email.trim(),password});
   if(error){setError(isAuthUnavailable(error)?"認証サービスに接続できません。時間をおいて再度お試しください。":"メールアドレスまたはパスワードを確認してください。");setBusy(false);return;}
   window.location.assign("/customer");
  }catch{setError("接続できません。時間をおいて再度お試しください。");setBusy(false);}
 }
 return <div className="admin-root admin-login-page"><main className="admin-login-card"><SakupageLogo variant="header"/><h1 className="admin-login-title">店舗管理ログイン</h1><form className="admin-login-form" onSubmit={submit}>
  <label className="admin-form-label">メールアドレス<input className="admin-form-input" type="email" autoComplete="username" value={email} onChange={e=>setEmail(e.target.value)} required disabled={busy}/></label>
  <label className="admin-form-label">パスワード<input className="admin-form-input" type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} required disabled={busy}/></label>
  {error&&<p role="alert" className="admin-form-error">{error}</p>}<button className="admin-btn admin-btn--primary" disabled={busy}>{busy?"ログイン中…":"ログイン"}</button>
 </form><Link href="/customer/recover" className="admin-btn admin-btn--ghost">パスワードをお忘れの方</Link></main></div>;
}
