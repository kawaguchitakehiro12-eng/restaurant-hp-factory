"use client";

import { useAdminUi } from "@/components/admin/AdminUiProvider";

type DirtyFormProps = {
  children: React.ReactNode;
  className?: string;
};

export function DirtyForm({ children, className }: DirtyFormProps) {
  const { setDirty } = useAdminUi();

  return (
    <div
      className={className}
      onChange={() => setDirty(true)}
      onInput={() => setDirty(true)}
    >
      {children}
    </div>
  );
}
