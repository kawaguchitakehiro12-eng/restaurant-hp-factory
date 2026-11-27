"use client";
export default function ErrorPage({reset}:{reset:()=>void}){return <div className="customer-main"><h1>現在接続できません</h1><p>店舗情報は変更されていません。時間をおいて再度お試しください。</p><button className="admin-btn admin-btn--primary" onClick={reset}>再読み込み</button></div>;}
