import type { NextConfig } from "next";
import { buildNextImageRemotePatterns } from "./src/lib/images/remote-image-hosts";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: buildNextImageRemotePatterns(),
  },
};

export default nextConfig;
