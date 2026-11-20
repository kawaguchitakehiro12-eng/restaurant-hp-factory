import {boundedServerFetch} from "@/lib/supabase/server-fetch";
import {isAuthUnavailable} from "@/lib/auth/service-error";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isOperatorUser, sanitizeAdminNextPath } from "@/lib/auth/operator-role";

/**
 * 管理画面への入口チェックとセッション更新のみを行う。
 * 認可の本体は各 Route Handler の requireOperatorApi() で必ず行うこと。
 */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isApi = pathname.startsWith("/api/");
  const isLogin = pathname === "/login";
  const isCustomer = pathname === "/customer" || pathname.startsWith("/customer/") || pathname.startsWith("/api/customer/");
  const isCustomerPublic = ["/customer/login", "/customer/recover", "/customer/password", "/customer/auth/callback"].includes(pathname);

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    if (isApi) {
      return NextResponse.json({ error: "Supabase is not configured" }, { status: 503 });
    }
    if (isLogin || isCustomerPublic) return NextResponse.next();
    if (isCustomer) return NextResponse.redirect(new URL("/customer/login", request.url));
    return NextResponse.redirect(new URL("/login", request.url));
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, key, {
    global:{fetch:boundedServerFetch},
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
        Object.entries(headers).forEach(([headerName, value]) =>
          response.headers.set(headerName, value)
        );
      },
    },
  });

  let user;
  try {
    const result=await supabase.auth.getUser();
    if(isAuthUnavailable(result.error))throw new Error("Auth unavailable");
    user=result.data.user;
  } catch {
    // 認証サービスの障害時も、認証を通過させない。
    const unavailable = isApi
      ? NextResponse.json({ error: "Authentication unavailable" }, { status: 503 })
      : new NextResponse("認証サービスに接続できません。時間をおいて再度お試しください。", { status: 503 });
    unavailable.headers.set("Cache-Control", "private, no-store");
    return unavailable;
  }
  response.headers.set("Cache-Control", "private, no-store");

  const withSessionCookies = (next: NextResponse) => {
    response.cookies.getAll().forEach((cookie) => next.cookies.set(cookie));
    next.headers.set("Cache-Control", "private, no-store");
    return next;
  };

  if (isCustomer) {
    if (isCustomerPublic) return response;
    if (!user) {
      return withSessionCookies(isApi
        ? NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        : NextResponse.redirect(new URL("/customer/login", request.url)));
    }
    // 所有店舗は顧客APIとサーバーページで必ず再確認する。
    return response;
  }

  if (isLogin) {
    if (user && isOperatorUser(user)) {
      const next = sanitizeAdminNextPath(request.nextUrl.searchParams.get("next"));
      return withSessionCookies(NextResponse.redirect(new URL(next, request.url)));
    }
    return response;
  }

  if (isApi) {
    if (!user) {
      return withSessionCookies(NextResponse.json({ error: "Unauthorized" }, { status: 401 }));
    }
    if (!isOperatorUser(user)) {
      return withSessionCookies(NextResponse.json({ error: "Forbidden" }, { status: 403 }));
    }
    return response;
  }

  if (!user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    return withSessionCookies(NextResponse.redirect(loginUrl));
  }
  if (!isOperatorUser(user)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("error", "forbidden");
    return withSessionCookies(NextResponse.redirect(loginUrl));
  }

  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/customer/:path*",
    "/api/customer/:path*",
    "/login",
    "/api/demo-sites/:path*",
    "/api/customers/:path*",
    "/api/admin/:path*",
  ],
};
