import { isIP } from "node:net";

export type DeliveryChannel = "sms" | "email";
export type DeliveryMode = "test" | "live" | "disabled";
export class DeliveryError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}
/** Bound bytes while reading, including chunked bodies without Content-Length. */
export async function readDeliveryBody(request: Request): Promise<string> {
  const declared = request.headers.get("content-length");
  if (declared && Number(declared) > 4096) throw new DeliveryError("入力が長すぎます。", 413);
  if (!request.body) return "";
  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let size = 0, text = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 4096) {
        await reader.cancel().catch(() => {});
        throw new DeliveryError("入力が長すぎます。", 413);
      }
      text += decoder.decode(value, { stream: true });
    }
    return text + decoder.decode();
  } finally { reader.releaseLock(); }
}
export function deliveryMode(env: NodeJS.ProcessEnv = process.env): DeliveryMode {
  const mode = env.DEMO_DELIVERY_MODE ?? "test";
  if (mode !== "test" && mode !== "live" && mode !== "disabled") return "disabled";
  return mode;
}
export function normalizeRecipient(channel: DeliveryChannel, raw: unknown): string {
  if (typeof raw !== "string" || raw.length > 254) throw new DeliveryError("宛先を確認してください。");
  const value = raw.trim();
  if (channel === "email") {
    if (!/^[^\s@<>;,]+@[^\s@<>;,]+\.[^\s@<>;,]+$/.test(value)) throw new DeliveryError("メールアドレスを確認してください。");
    return value;
  }
  const phone = value.replace(/[\s()-]/g, "");
  const normalized = /^0[789]0\d{8}$/.test(phone) ? "+81" + phone.slice(1) : phone;
  if (!/^\+81[789]0\d{8}$/.test(normalized)) throw new DeliveryError("日本の携帯電話番号（070・080・090）を入力してください。");
  return normalized;
}
export function publicDeliveryBase(raw: string | undefined): string {
  try {
    const u = new URL(raw ?? "");
    const host = u.hostname.replace(/^\[|\]$/g, "");
    if (u.protocol !== "https:" || u.username || u.password || u.port || u.pathname !== "/" || u.search || u.hash || isIP(host) || !host.includes(".") || /(?:^|\.)(?:localhost|local|internal|test|invalid|example)$/.test(host) || host.endsWith(".localhost")) throw new Error();
    return u.origin;
  } catch { throw new DeliveryError("実送信には外部公開済みのHTTPS URLを設定してください。", 503); }
}
export function dailyDeliveryLimit(env: NodeJS.ProcessEnv = process.env): number {
  const n = Number(env.DEMO_DELIVERY_DAILY_LIMIT ?? "100");
  if (!Number.isInteger(n) || n < 1 || n > 10000) throw new DeliveryError("送信上限の設定を確認してください。", 503);
  return n;
}
/** Conservative UCS-2 upper bound, including two UTF-16 units for emoji. */
export function smsSegmentUpperBound(text:string):number{return text.length<=70?1:Math.ceil(text.length/67);}
export function smsBudget(text:string,env:NodeJS.ProcessEnv=process.env){
  const segments=smsSegmentUpperBound(text),max=Number(env.DEMO_SMS_MAX_SEGMENTS??4),daily=Number(env.DEMO_DAILY_SMS_SEGMENTS??100);
  if(!Number.isInteger(max)||max<1||max>10||!Number.isInteger(daily)||daily<1||daily>10000)throw new DeliveryError("SMS上限の設定を確認してください。",503);
  if(segments>max)throw new DeliveryError(`SMSが長すぎます（最大見積もり${segments}通分）。文面・店舗名を短くしてください。`);
  return {segments,daily};
}
export type OutboundMessage = { channel: DeliveryChannel; recipient: string; text: string; subject: string; id: string };
export function providerReady(channel: DeliveryChannel, env: NodeJS.ProcessEnv = process.env): boolean {
  return channel === "sms"
    ? Boolean(/^AC[0-9a-f]{32}$/i.test(env.TWILIO_ACCOUNT_SID ?? "") && env.TWILIO_AUTH_TOKEN && (env.TWILIO_MESSAGING_SERVICE_SID || env.TWILIO_FROM))
    : Boolean(env.RESEND_API_KEY && env.DEMO_EMAIL_FROM && !/[\r\n]/.test(env.DEMO_EMAIL_FROM));
}
/** Accepted means the provider queued the request, not that the handset/inbox received it. */
export async function dispatchMessage(message: OutboundMessage, env: NodeJS.ProcessEnv = process.env, send: typeof fetch = fetch): Promise<{status: "accepted" | "failed" | "unknown"; providerId?: string}> {
  if (!providerReady(message.channel, env)) throw new DeliveryError("送信サービスの接続設定が完了していません。", 503);
  try {
    let response: Response;
    if (message.channel === "sms") {
      const form = new URLSearchParams({ To: message.recipient, Body: message.text });
      if (env.TWILIO_MESSAGING_SERVICE_SID) form.set("MessagingServiceSid", env.TWILIO_MESSAGING_SERVICE_SID);
      else form.set("From", env.TWILIO_FROM!);
      response = await send(`https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Messages.json`, { method: "POST", headers: { Authorization: "Basic " + Buffer.from(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`).toString("base64"), "Content-Type": "application/x-www-form-urlencoded" }, body: form, signal: AbortSignal.timeout(12000), redirect: "error" });
    } else {
      response = await send("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json", "Idempotency-Key": message.id }, body: JSON.stringify({ from: env.DEMO_EMAIL_FROM, to: [message.recipient], subject: message.subject, text: message.text }), signal: AbortSignal.timeout(12000), redirect: "error" });
    }
    // A timeout/5xx may occur after acceptance: never automatically resend.
    if (response.status >= 500 || response.status === 408) return { status: "unknown" };
    if (!response.ok) return { status: "failed" };
    const data = await response.json();
    const id = message.channel === "sms" ? data.sid : data.id;
    return typeof id === "string" && id.length < 200 ? { status: "accepted", providerId: id } : { status: "unknown" };
  } catch { return { status: "unknown" }; }
}
