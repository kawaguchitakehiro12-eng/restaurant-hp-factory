"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Check } from "lucide-react";

type ToastState = {
  title: string;
  message?: string;
} | null;

type AdminUiContextValue = {
  dirty: boolean;
  setDirty: (dirty: boolean) => void;
  showToast: (title: string, message?: string) => void;
  confirmLeave: () => boolean;
};

const AdminUiContext = createContext<AdminUiContextValue | null>(null);

export function AdminUiProvider({ children }: { children: ReactNode }) {
  const [dirty, setDirty] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  const showToast = useCallback((title: string, message?: string) => {
    setToast({ title, message });
    window.setTimeout(() => setToast(null), 3000);
  }, []);

  const confirmLeave = useCallback(() => {
    if (!dirty) return true;
    return window.confirm(
      "変更が保存されていません。\nこのまま離れますか？"
    );
  }, [dirty]);

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!dirty) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  const value = useMemo(
    () => ({ dirty, setDirty, showToast, confirmLeave }),
    [dirty, showToast, confirmLeave]
  );

  return (
    <AdminUiContext.Provider value={value}>
      {children}
      {toast && (
        <div className="admin-toast" role="status" aria-live="polite">
          <Check size={16} strokeWidth={2.5} />
          <div>
            <p className="admin-toast-title">{toast.title}</p>
            {toast.message && (
              <p className="admin-toast-message">{toast.message}</p>
            )}
          </div>
        </div>
      )}
    </AdminUiContext.Provider>
  );
}

export function useAdminUi() {
  const ctx = useContext(AdminUiContext);
  if (!ctx) {
    throw new Error("useAdminUi must be used within AdminUiProvider");
  }
  return ctx;
}

/** フォーム内の変更を検知して dirty フラグを立てる */
export function useMarkDirtyOnChange() {
  const { setDirty } = useAdminUi();
  return () => setDirty(true);
}
