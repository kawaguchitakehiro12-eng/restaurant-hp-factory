import {isAuthUnavailable} from "@/lib/auth/service-error";
import type { User } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { isOperatorUser } from "@/lib/auth/operator-role";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export type OperatorAuthResult =
  | { status: "ok"; user: User }
  | { status: "unauthenticated" }
  | { status: "unavailable" }
  | { status: "forbidden"; user: User };

/** サーバー専用。getUser() で Auth サーバーに照会し、Cookie の内容をそのまま信用しない */
async function readAuthUser(): Promise<User | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.auth.getUser();
    if(isAuthUnavailable(error))throw new Error("Auth unavailable");
    if (error || !data.user) return null;
    return data.user;
  } catch {
    throw new Error("Auth unavailable");
  }
}

export async function getAuthUser():Promise<User|null>{try{return await readAuthUser()}catch{return null}}

export async function getOperatorAuth(): Promise<OperatorAuthResult> {
  let user;try{user=await readAuthUser()}catch{return {status:"unavailable"}}
  if (!user) return { status: "unauthenticated" };
  if (!isOperatorUser(user)) return { status: "forbidden", user };
  return { status: "ok", user };
}

/** Route Handler 用。認可済みなら null、そうでなければ返すべきレスポンス */
export async function requireOperatorApi(): Promise<NextResponse | null> {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase is not configured" }, { status: 503 });
  }
  const auth = await getOperatorAuth();
  if(auth.status==="unavailable")return NextResponse.json({error:"認証サービスに接続できません。入力を保持して時間をおいて再試行してください。"},{status:503,headers:{"Cache-Control":"private, no-store"}});
  if (auth.status === "unauthenticated") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (auth.status === "forbidden") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}

/**
 * 顧客ダッシュボード（/dashboard/demo/{slug}）用 API の認可。
 * 顧客ログイン実装までは運営者のみ許可する。
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- 顧客ログイン実装時に所有者判定で使う
export async function requireDemoSiteEditorApi(slug: string): Promise<NextResponse | null> {
  return requireOperatorApi();
}
