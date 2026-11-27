import { Check } from "lucide-react";
import type { PublishQualityReport } from "@/lib/admin/publish-quality-check";
import { publishQualityLevel } from "@/lib/admin/publish-quality-check";

type PublishQualityPanelProps = {
  report: PublishQualityReport;
  compact?: boolean;
};

export function PublishQualityPanel({ report, compact = false }: PublishQualityPanelProps) {
  const level = publishQualityLevel(report.score);
  const missing = report.items.filter((i) => !i.done);

  return (
    <div
      className={`admin-quality-panel${compact ? " admin-quality-panel--compact" : ""}`}
      data-level={level}
    >
      <div className="admin-quality-panel-header">
        <div>
          <p className="admin-quality-eyebrow">サイト完成度</p>
          {!compact ? (
            <p className="admin-quality-lead">
              {level === "good"
                ? "公開に問題ありません"
                : level === "warn"
                  ? "公開前に不足項目の確認をおすすめします"
                  : "内容が不足しています。公開前に編集してください"}
            </p>
          ) : null}
        </div>
        <div className="admin-progress-ring admin-progress-ring--quality" data-progress={report.score}>
          <span>{report.score}%</span>
        </div>
      </div>

      <div className="admin-progress-bar">
        <div
          className="admin-progress-fill admin-progress-fill--quality"
          data-level={level}
          style={{ width: `${report.score}%` }}
        />
      </div>

      {missing.length > 0 ? (
        <ul className="admin-quality-missing" aria-label="不足項目">
          {missing.map((item) => (
            <li key={item.id}>{item.missingLabel}</li>
          ))}
        </ul>
      ) : (
        <p className="admin-quality-complete">すべての必須項目が入力済みです</p>
      )}

      {!compact ? (
        <ul className="admin-checklist-items admin-quality-checklist">
          {report.items.map((item) => (
            <li
              key={item.id}
              data-done={item.done ? "true" : "false"}
              data-pending={!item.done ? "true" : "false"}
              title={item.hint}
            >
              <span className="admin-checklist-check">
                {item.done ? <Check size={12} strokeWidth={2.5} /> : null}
              </span>
              <span>{item.label}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
