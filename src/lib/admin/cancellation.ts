/** 解約通知予約日（最低利用期間終了の1ヶ月前） */
export function getCancellationNoticeDate(minimumTermEndDate: string): string {
  const end = new Date(minimumTermEndDate);
  end.setMonth(end.getMonth() - 1);
  const y = end.getFullYear();
  const m = String(end.getMonth() + 1).padStart(2, "0");
  const d = String(end.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
