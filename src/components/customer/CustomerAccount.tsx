"use client";
import {confirmBeforeLeaving} from "@/lib/browser/unsaved-changes";
import {useState} from "react";
import Link from "next/link";
import {createBrowserSupabaseClient} from "@/lib/supabase/client";
export function CustomerAccount(){const [busy,setBusy]=useState(false),[error,setError]=useState(false);return <div className="customer-account"><Link href="/customer/password">パスワード変更</Link><button className="admin-btn admin-btn--secondary" disabled={busy} onClick={async()=>{if(!confirmBeforeLeaving())return;setBusy(true);try{const {error}=await createBrowserSupabaseClient().auth.signOut();if(error)throw error;window.location.assign("/customer/login");}catch{setError(true);setBusy(false);}}}>{busy?"ログアウト中…":"ログアウト"}</button>{error&&<span role="alert">ログアウトできませんでした。再度お試しください。</span>}</div>;}
