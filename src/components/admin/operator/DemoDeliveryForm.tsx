"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { DemoSite } from "@/types/demo";
import { DELIVERY_STATUS_LABELS, type DemoDelivery } from "@/types/demo-delivery";
import { throwIfAuthError } from "@/lib/data/api-errors";
import { useOperatorAdmin } from "@/components/admin/operator/OperatorAdminProvider";

type Preview = { mode: "test" | "live"; channel: "sms" | "email"; recipient: string; text: string; subject: string; hash: string; smsSegments:number };
async function api(body: object) {
  const res = await fetch("/api/admin/demo-deliveries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  throwIfAuthError(res);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "送信処理に失敗しました。履歴を確認してください。");
  return data;
}
export function DemoDeliveryForm({ site, shareId }: { site: DemoSite; shareId: string }) {
  const [channel, setChannel] = useState<"sms" | "email">("sms");
  const [recipient, setRecipient] = useState(site.phone ?? "");
  const [preview, setPreview] = useState<Preview | null>(null);
  const [deliveries, setDeliveries] = useState<DemoDelivery[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const requestId = useRef("");
  const inFlight = useRef(false);
  const { reportAuthError } = useOperatorAdmin();
  const history = useCallback(async () => {
    const res = await fetch(`/api/admin/demo-deliveries?shareId=${encodeURIComponent(shareId)}`, { cache: "no-store" });
    throwIfAuthError(res);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "送信履歴の取得に失敗しました。");
    return data.deliveries as DemoDelivery[];
  }, [shareId]);
  useEffect(() => { let active = true; void history().then(items => { if (active) setDeliveries(items); }).catch(cause => { if (active) { reportAuthError(cause); setError("送信履歴を取得できません。再送前に履歴を更新してください。"); } }); return () => { active = false; }; }, [history, reportAuthError]);
  const reset = () => { setPreview(null); setConfirmed(false); setNotice(""); setError(""); requestId.current = ""; };
  const run = async (intent: "preview" | "send") => {
    if (inFlight.current) return;
    inFlight.current = true; setBusy(true); setError(""); setNotice("");
    try {
      if (intent === "preview") {
        const data = await api({ intent, shareId, channel, recipient });
        setPreview(data.preview); setConfirmed(false); requestId.current = crypto.randomUUID();
      } else if (preview && confirmed && requestId.current) {
        const data = await api({ intent, shareId, channel, recipient, previewHash: preview.hash, requestId: requestId.current });
        setNotice(DELIVERY_STATUS_LABELS[(data.delivery as DemoDelivery).status]);
        setConfirmed(false);
        setDeliveries(await history());
      }
    } catch (cause) { reportAuthError(cause); setError(cause instanceof Error ? cause.message : "処理に失敗しました。履歴を確認してください。"); }
    finally { inFlight.current = false; setBusy(false); }
  };
  return <section aria-label="デモURLの送信" className="admin-share-manage">
    <h3>SMS・メールで送る</h3>
    <p className="admin-form-hint">宛先と内容を確認してから送信します。テストモードでは相手に届きません。</p>
    <div className="admin-form-group">
      <label className="admin-form-label" htmlFor="delivery-channel">送信方法</label>
      <select id="delivery-channel" className="admin-form-select" value={channel} disabled={busy} onChange={e => { const value = e.target.value as "sms" | "email"; setChannel(value); setRecipient(value === "sms" ? site.phone ?? "" : site.email ?? ""); reset(); }}><option value="sms">SMS</option><option value="email">メール</option></select>
    </div>
    <div className="admin-form-group">
      <label className="admin-form-label" htmlFor="delivery-recipient">{channel === "sms" ? "携帯電話番号" : "メールアドレス"}</label>
      <input id="delivery-recipient" className="admin-form-input" type={channel === "sms" ? "tel" : "email"} maxLength={254} autoComplete="off" value={recipient} disabled={busy} onChange={e => { setRecipient(e.target.value); reset(); }} />
    </div>
    <button type="button" className="admin-btn admin-btn--secondary" disabled={busy || !recipient.trim()} onClick={() => void run("preview")}>送信内容を確認</button>
    {preview && <div>
      <p><strong>{preview.mode === "test" ? "テストモード：実際には送信しません" : "実送信：送信料金が発生します"}</strong></p>
      <p>宛先：{preview.recipient}</p>
      {preview.channel==="sms"&&<p>SMS課金単位の最大見積もり：{preview.smsSegments}通分（実際の料金は送信サービスによります）</p>}
      {preview.subject && <p>件名：{preview.subject}</p>}
      <pre style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", fontFamily: "inherit" }}>{preview.text}</pre>
      <label><input type="checkbox" checked={confirmed} disabled={busy} onChange={e => setConfirmed(e.target.checked)} /> 宛先・文面を確認し、相手からURL送付の了承を得ています</label>
      <div><button type="button" className="admin-btn admin-btn--primary" disabled={busy || !confirmed} onClick={() => void run("send")}>{busy ? "処理中…" : preview.mode === "test" ? "テスト送信（実送信なし）" : "送信する"}</button></div>
    </div>}
    {notice && <p role="status">{notice}</p>}
    {error && <p className="admin-form-error" role="alert">{error}</p>}
    <h4>送信履歴（最新20件）</h4>
    <button type="button" className="admin-btn admin-btn--ghost" disabled={busy} onClick={() => { void history().then(items => { setDeliveries(items); setError(""); }).catch(cause => { reportAuthError(cause); setError("履歴の更新に失敗しました。"); }); }}>履歴を更新</button>
    {deliveries.length === 0 ? <p>送信履歴はありません。</p> : <ul>{deliveries.map(item => <li key={item.id}>{new Date(item.created_at).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })} / {item.channel === "sms" ? "SMS" : "メール"} / {item.recipient} / {DELIVERY_STATUS_LABELS[item.status]}</li>)}</ul>}
    <p className="admin-form-hint">「受付済み」は相手への到達を保証しません。結果不明・処理中の場合は、送信サービスの履歴を確認してから再送してください。</p>
  </section>;
}
