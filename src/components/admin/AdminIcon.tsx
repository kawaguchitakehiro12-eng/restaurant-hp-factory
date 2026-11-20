import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Svg({ size = 16, children, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      {children}
    </svg>
  );
}

export type AdminIconName =
  | "dashboard"
  | "settings"
  | "topics"
  | "photos"
  | "menu"
  | "billing"
  | "customers"
  | "stores"
  | "sites"
  | "edit"
  | "check"
  | "upload"
  | "external"
  | "chevron";

type AdminIconProps = {
  name: AdminIconName;
  size?: number;
  className?: string;
};

export function AdminIcon({ name, size = 16, className }: AdminIconProps) {
  const cn = `admin-icon ${className ?? ""}`.trim();

  switch (name) {
    case "dashboard":
      return (
        <span className={cn}>
          <Svg size={size}>
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </Svg>
        </span>
      );
    case "settings":
      return (
        <span className={cn}>
          <Svg size={size}>
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </Svg>
        </span>
      );
    case "topics":
      return (
        <span className={cn}>
          <Svg size={size}>
            <path d="M4 6h16M4 12h10M4 18h14" />
          </Svg>
        </span>
      );
    case "photos":
      return (
        <span className={cn}>
          <Svg size={size}>
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <circle cx="9" cy="11" r="2" />
            <path d="M21 15l-5-5L5 19" />
          </Svg>
        </span>
      );
    case "menu":
      return (
        <span className={cn}>
          <Svg size={size}>
            <path d="M4 7h16M4 12h16M4 17h10" />
          </Svg>
        </span>
      );
    case "billing":
      return (
        <span className={cn}>
          <Svg size={size}>
            <rect x="2" y="5" width="20" height="14" rx="2" />
            <path d="M2 10h20" />
          </Svg>
        </span>
      );
    case "customers":
      return (
        <span className={cn}>
          <Svg size={size}>
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
          </Svg>
        </span>
      );
    case "stores":
      return (
        <span className={cn}>
          <Svg size={size}>
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <path d="M9 22V12h6v10" />
          </Svg>
        </span>
      );
    case "sites":
      return (
        <span className={cn}>
          <Svg size={size}>
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </Svg>
        </span>
      );
    case "edit":
      return (
        <span className={cn}>
          <Svg size={size}>
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </Svg>
        </span>
      );
    case "check":
      return (
        <span className={cn}>
          <Svg size={size}>
            <path d="M20 6L9 17l-5-5" />
          </Svg>
        </span>
      );
    case "upload":
      return (
        <span className={cn}>
          <Svg size={size}>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <path d="M17 8l-5-5-5 5M12 3v12" />
          </Svg>
        </span>
      );
    case "external":
      return (
        <span className={cn}>
          <Svg size={size}>
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <path d="M15 3h6v6M10 14L21 3" />
          </Svg>
        </span>
      );
    case "chevron":
      return (
        <span className={cn}>
          <Svg size={size}>
            <path d="M9 18l6-6-6-6" />
          </Svg>
        </span>
      );
    default:
      return null;
  }
}
