import type { NextConfig } from "next";
import { buildNextImageRemotePatterns } from "./src/lib/images/remote-image-hosts";

/** LAN スマホ確認用（開発時のみ）。DEV_ALLOWED_ORIGINS=192.168.x.x で指定 */
function getDevAllowedOrigins(): string[] {
  return (
    process.env.DEV_ALLOWED_ORIGINS?.split(",")
      .map((host) => host.trim())
      .filter(Boolean) ?? []
  );
}

const devAllowedOrigins = getDevAllowedOrigins();

const nextConfig: NextConfig = {
  distDir: process.env.SAKUPAGE_ISOLATED_BUILD === "true" ? ".next-sales" : ".next",
  // Keep both the app's Sharp and Next's nested native runtime in server functions.
  outputFileTracingIncludes: {
    "/*": [
      "./node_modules/sharp/**/*",
      "./node_modules/@img/sharp-linux-x64/**/*",
      "./node_modules/@img/sharp-libvips-linux-x64/**/*",
      "./node_modules/next/node_modules/sharp/**/*",
      "./node_modules/next/node_modules/@img/sharp-linux-x64/**/*",
      "./node_modules/next/node_modules/@img/sharp-libvips-linux-x64/**/*",
    ],
  },
  async headers(){return [
    {source:'/:path*',headers:[{key:'X-Content-Type-Options',value:'nosniff'},{key:'Referrer-Policy',value:'strict-origin-when-cross-origin'}]},
    ...['/api/demo-sites/:path*','/api/customers/:path*','/api/admin/:path*','/api/customer/:path*'].map(source=>({source,headers:[{key:'Cache-Control',value:'private, no-store'},{key:'X-Frame-Options',value:'DENY'},{key:'Referrer-Policy',value:'no-referrer'},{key:'X-Robots-Tag',value:'noindex, nofollow'}]})),
    ...['/admin/:path*','/dashboard/:path*','/customer/:path*','/login'].map(source=>({source,headers:[{key:'X-Frame-Options',value:'DENY'},{key:'X-Robots-Tag',value:'noindex, nofollow'}]})),
    ...['/share/:path*','/api/public/share/:path*','/customer/:path*','/login'].map(source=>({source,headers:[{key:'Referrer-Policy',value:'no-referrer'},{key:'X-Robots-Tag',value:'noindex, nofollow'}]}))
  ]},
  images: {
    remotePatterns: buildNextImageRemotePatterns(),
  },
  ...(process.env.NODE_ENV === "development" && devAllowedOrigins.length > 0
    ? { allowedDevOrigins: devAllowedOrigins }
    : {}),
};

export default nextConfig;
