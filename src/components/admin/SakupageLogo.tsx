"use client";

import { useState } from "react";
import {
  LOGO_FRAME_HEIGHT,
  LOGO_FRAME_WIDTH,
  LOGO_PATH,
} from "@/lib/admin/tokens";

type SakupageLogoProps = {
  variant?: "sidebar" | "header";
  enabled?: boolean;
};

export function SakupageLogo({
  variant = "sidebar",
  enabled = true,
}: SakupageLogoProps) {
  const [failed, setFailed] = useState(false);

  if (!enabled) {
    return null;
  }

  if (failed) {
    return (
      <div className="sakupage-logo-fallback" aria-label="SAKUPAGE">
        <span className="sakupage-logo-fallback-mark">S</span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={LOGO_PATH}
      alt="SAKUPAGE"
      width={LOGO_FRAME_WIDTH}
      height={LOGO_FRAME_HEIGHT}
      className={`sakupage-logo-img sakupage-logo-img--${variant}`}
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}
