import type { Metadata } from "next";

/** SAKUPAGE 管理画面デザイントークン */
export const ADMIN_TOKENS = {
  primary: "#FF8A00",
  primaryHover: "#F07A00",
  primaryLight: "#FFF4E8",
  border: "#EFE7DE",
  text: "#1E1E1E",
  muted: "#6E6E6E",
  surface: "#FFFFFF",
  bg: "#FAFAFA",
  gradient: "linear-gradient(135deg, #FF8A00 0%, #FFB347 100%)",
  radius: "10px",
  radiusLg: "14px",
  shadow: "0 1px 3px rgba(30, 30, 30, 0.04), 0 4px 16px rgba(30, 30, 30, 0.03)",
  shadowHover: "0 2px 8px rgba(30, 30, 30, 0.06), 0 8px 24px rgba(255, 138, 0, 0.08)",
} as const;

export const LOGO_PATH = "/branding/logo-horizontal.png";
export const ICON_PATH = "/brand/sakupage-icon.png";

/** 公式横長ロゴ（透過PNG・添付そのまま） */
export const LOGO_FRAME_WIDTH = 1024;
export const LOGO_FRAME_HEIGHT = 732;

export const ADMIN_FAVICON_ICONS: NonNullable<Metadata["icons"]> = {
  icon: [
    { url: "/brand/favicon-32.png", sizes: "32x32", type: "image/png" },
    { url: "/brand/favicon-64.png", sizes: "64x64", type: "image/png" },
  ],
  apple: [{ url: "/brand/apple-touch-icon-180.png", sizes: "180x180", type: "image/png" }],
};
