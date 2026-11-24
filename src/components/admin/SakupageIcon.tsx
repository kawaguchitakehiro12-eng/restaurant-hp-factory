"use client";

import Image from "next/image";
import { useState } from "react";
import { ICON_PATH } from "@/lib/admin/tokens";

type SakupageIconProps = {
  size?: 24 | 32 | 48;
};

export function SakupageIcon({ size = 32 }: SakupageIconProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span className="sakupage-icon-fallback" style={{ width: size, height: size }} aria-hidden>
        S
      </span>
    );
  }

  return (
    <Image
      src={ICON_PATH}
      alt=""
      width={size}
      height={size}
      className="sakupage-icon-img"
      onError={() => setFailed(true)}
    />
  );
}
