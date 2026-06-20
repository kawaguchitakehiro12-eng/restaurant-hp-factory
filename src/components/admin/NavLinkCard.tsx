import Link from "next/link";
import { ChevronRight, Pencil } from "lucide-react";
import { NAV_ICONS, type NavIconName } from "@/components/admin/nav-icons";
import { formatDate } from "@/lib/admin/labels";

type NavLinkCardProps = {
  href: string;
  title: string;
  icon: NavIconName;
  status: string;
  detail?: string;
  meta?: string;
};

export function NavLinkCard({
  href,
  title,
  icon,
  status,
  detail,
  meta,
}: NavLinkCardProps) {
  const Icon = NAV_ICONS[icon];

  return (
    <Link href={href} className="admin-nav-card">
      <div className="admin-nav-card-icon">
        <Icon size={18} strokeWidth={1.75} />
      </div>
      <div className="admin-nav-card-body">
        <div className="admin-nav-card-head">
          <h3>{title}</h3>
          <span className="admin-nav-card-edit">
            <Pencil size={12} strokeWidth={1.75} />
            編集
          </span>
        </div>
        <p className="admin-nav-card-status">{status}</p>
        {detail && <p className="admin-nav-card-detail">{detail}</p>}
        {meta && <p className="admin-nav-card-meta">{meta}</p>}
      </div>
      <ChevronRight size={16} className="admin-nav-card-chevron" strokeWidth={1.75} />
    </Link>
  );
}
