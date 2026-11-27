import {MockSmsGateway,MockMailGateway} from '@/lib/commerce/providers';
import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { getOperatorAuth } from "@/lib/auth/operator";
import { isSameOriginRequest } from "@/lib/auth/request-origin";
import { createAdminDbClient } from "@/lib/supabase/admin";
import { getDemoShareRepository } from "@/lib/repositories/supabase/demo-share-supabase";
import { getDemoSiteRepository } from "@/lib/repositories";
import { isDemoShareValid } from "@/lib/admin/demo-share-utils";
import { isSharedSiteVisible } from "@/lib/stores/site-visibility";
import { buildShareEmailBody, buildShareEmailSubject, buildShareSmsText } from "@/lib/admin/demo-share-messages";
import { DeliveryError, readDeliveryBody, deliveryMode, normalizeRecipient, publicDeliveryBase, providerReady, dailyDeliveryLimit, dispatchMessage, smsBudget } from "@/lib/delivery/core";

export const runtime = "nodejs";
function json(body: unknown, status = 200) { return NextResponse.json(body, { status, headers: { "Cache-Control": "private, no-store" } }); }
async function operator() {
  const auth = await getOperatorAuth();
  if (auth.status !== "ok") throw new DeliveryError("運営者ログインが必要です。", auth.status === "unavailable" ? 503 : auth.status === "forbidden" ? 403 : 401);
  return auth.user;
}
function failure(error: unknown) {
  if (error instanceof DeliveryError) return json({ error: error.message }, error.status);
  // Never log provider responses, credentials, phone numbers or message text.
  return json({ error: "送信情報を保存・取得できませんでした。再送前に履歴を確認してください。" }, 503);
}
const columns = "id,channel,recipient,mode,status,created_at";
export async function GET(request: Request) {
  try {
    await operator();
    const shareId = new URL(request.url).searchParams.get("shareId");
    if (!shareId || shareId.length > 200) throw new DeliveryError("共有URLを選択してください。");
    const { data, error } = await createAdminDbClient().from("demo_deliveries").select(columns).eq("share_id", shareId).order("created_at", { ascending: false }).limit(20);
    if (error) throw error;
    return json({ deliveries: data });
  } catch (error) { return failure(error); }
}
export async function POST(request: Request) {
  try {
    const user = await operator();
    if (!isSameOriginRequest(request)) throw new DeliveryError("同じ画面から操作してください。", 403);
    const raw = await readDeliveryBody(request);
    let body;
    try { body = JSON.parse(raw); } catch { throw new DeliveryError("入力形式を確認してください。"); }
    if (!body || typeof body !== "object" || !["preview", "send"].includes(body.intent) || !["sms", "email"].includes(body.channel) || typeof body.shareId !== "string" || body.shareId.length > 200) throw new DeliveryError("送信内容を確認してください。");
    const channel: "sms" | "email" = body.channel;
    const recipient = normalizeRecipient(channel, body.recipient);
    const mode = deliveryMode();
    if (mode === "disabled") throw new DeliveryError("送信機能は停止中です。", 503);
    const share = await getDemoShareRepository().findById(body.shareId);
    if (!share || !isDemoShareValid(share)) throw new DeliveryError("共有URLが無効、または期限切れです。", 409);
    const site = await getDemoSiteRepository().findById(share.demoSiteId);
    if (!site || !isSharedSiteVisible(site)) throw new DeliveryError("このデモは共有できません。", 409);
    if (mode === "live") {
      publicDeliveryBase(process.env.NEXT_PUBLIC_APP_URL);
      if (!providerReady(channel)) throw new DeliveryError("送信サービスの接続設定が完了していません。", 503);
    }
    const input = { prospectName: site.prospectName, storeName: site.storeName, contactPersonName: site.contactPersonName, shareToken: share.shareToken };
    const text = channel === "sms" ? buildShareSmsText(input) : buildShareEmailBody(input);
    const subject = channel === "email" ? buildShareEmailSubject() : "";
    const budget=channel==="sms"?smsBudget(text):{segments:0,daily:100};
    const hash = createHash("sha256").update(JSON.stringify([user.id, mode, share.id, channel, recipient, text, subject])).digest("hex");
    if (body.intent === "preview") return json({ preview: { mode, channel, recipient, text, subject, hash, smsSegments:budget.segments } });
    if (body.previewHash !== hash) throw new DeliveryError("設定・宛先・文面が変わりました。もう一度内容を確認してください。", 409);
    if (typeof body.requestId !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.requestId)) throw new DeliveryError("内容確認からやり直してください。");
    const db = createAdminDbClient();
    const args={p_id:body.requestId,p_actor:user.id,p_share:share.id,p_channel:channel,p_recipient:recipient,p_mode:mode,p_hash:hash,p_daily_limit:dailyDeliveryLimit()};
    const { data: reservation, error } = mode==="test" ? await db.rpc("reserve_demo_delivery",args) : await db.rpc("reserve_demo_delivery_v2",{...args,p_budget_hash:createHash("sha256").update(JSON.stringify([share.id,channel,recipient,text,subject])).digest("hex"),p_sms_units:budget.segments,p_sms_limit:budget.daily});
    if (error) {
      if (error.code === "PT429") throw new DeliveryError("送信間隔または本日の送信上限に達しました。履歴を確認してください。", 429);
      if (error.code === "PT409") throw new DeliveryError("送信情報が変更されています。履歴と共有URLを確認してください。", 409);
      throw error;
    }
    if (!reservation.claimed) return json({ delivery: reservation.delivery });
    let result:{status:string;providerId?:string};
    if(mode==="test"){const message={id:body.requestId,channel,recipient,text,subject};const sms=new MockSmsGateway();const simulated=channel==="sms"?await sms.send(message,sms.preview(message).hash):await new MockMailGateway().send(body.requestId);result={status:simulated.state==="simulated"?"tested":simulated.state};}else result=await dispatchMessage({id:body.requestId,channel,recipient,text,subject});
    const { data, error: saveError } = await db.from("demo_deliveries").update({ status: result.status, provider_id: "providerId" in result ? result.providerId : null, updated_at: new Date().toISOString() }).eq("id", body.requestId).eq("status", "processing").select(columns).single();
    if (saveError) throw saveError;
    return json({ delivery: data });
  } catch (error) { return failure(error); }
}
