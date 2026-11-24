import Link from "next/link";
import { Check } from "lucide-react";
import type { OnboardingItem } from "@/lib/admin/helpers";

type OnboardingChecklistProps = {
  items: OnboardingItem[];
  progress: number;
};

const CTA_MAP: Record<string, { href: string; label: string }> = {
  reservation: { href: "/dashboard/settings", label: "予約URLを設定する" },
  settings: { href: "/dashboard/settings", label: "基本情報を入力する" },
  photos: { href: "/dashboard/photos", label: "写真を登録する" },
  menu: { href: "/dashboard/menu", label: "メニューを登録する" },
  site: { href: "/", label: "サイトを確認する" },
};

export function OnboardingChecklist({ items, progress }: OnboardingChecklistProps) {
  const doneCount = items.filter((i) => i.done).length;
  const remaining = items.length - doneCount;
  const firstIncomplete = items.find((i) => !i.done);
  const cta = firstIncomplete ? CTA_MAP[firstIncomplete.id] : undefined;

  return (
    <div className="admin-card admin-checklist admin-checklist--featured">
      <div className="admin-checklist-header">
        <div>
          <p className="admin-checklist-eyebrow">開設チェックリスト</p>
          <h2 className="admin-checklist-title">
            {doneCount}/{items.length} 完了
          </h2>
          <p className="admin-checklist-sub">
            {remaining > 0
              ? `公開まであと${remaining}ステップ`
              : "公開準備が完了しました"}
          </p>
        </div>
        <div className="admin-progress-ring" data-progress={progress}>
          <span>{progress}%</span>
        </div>
      </div>

      <div className="admin-progress-bar">
        <div className="admin-progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <ul className="admin-checklist-items">
        {items.map((item) => (
          <li
            key={item.id}
            data-done={item.done ? "true" : "false"}
            data-pending={!item.done ? "true" : "false"}
          >
            <span className="admin-checklist-check">
              {item.done ? <Check size={12} strokeWidth={2.5} /> : null}
            </span>
            <span>{item.label}</span>
          </li>
        ))}
      </ul>

      {cta && remaining > 0 && (
        <div className="admin-checklist-cta">
          <Link href={cta.href} className="admin-btn admin-btn--primary">
            {cta.label}
          </Link>
        </div>
      )}
    </div>
  );
}
