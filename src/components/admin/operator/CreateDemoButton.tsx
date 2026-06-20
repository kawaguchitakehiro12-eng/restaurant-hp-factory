"use client";

import { useOperatorAdmin } from "@/components/admin/operator/OperatorAdminProvider";

export function CreateDemoButton() {
  const { openDemoModal } = useOperatorAdmin();

  return (
    <button
      type="button"
      className="admin-btn admin-btn--primary"
      onClick={openDemoModal}
    >
      + デモサイト作成
    </button>
  );
}
