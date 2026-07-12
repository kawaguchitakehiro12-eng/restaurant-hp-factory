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
  images: {
    remotePatterns: buildNextImageRemotePatterns(),
  },
  ...(process.env.NODE_ENV === "development" && devAllowedOrigins.length > 0
    ? { allowedDevOrigins: devAllowedOrigins }
    : {}),
};

export default nextConfig;
