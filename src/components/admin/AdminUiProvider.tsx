"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { installUnsavedChangesGuard } from "@/lib/browser/unsaved-changes";
import { AlertCircle, Check } from "lucide-react";

type ToastVariant = "success" | "error";

type ToastState = {
  title: string;
  message?: string;
  variant: ToastVariant;
} | null;

type AdminUiContextValue = {
  dirty: boolean;
  setDirty: (dirty: boolean) => void;
  getDirtyRevision: () => number;
  markSaved: (revision: number) => boolean;
  showToast: (title: string, message?: string, variant?: ToastVariant) => void;
  confirmLeave: () => boolean;
};

const AdminUiContext = createContext<AdminUiContextValue | null>(null);

export function AdminUiProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [dirtyState, setDirtyState] = useState({ pathname, value: false });
  const dirty = dirtyState.pathname === pathname && dirtyState.value;
  const dirtyRevision = useRef(0);
  const setDirty = useCallback((next: boolean) => {
    if (next) dirtyRevision.current += 1;
    setDirtyState({ pathname, value: next });
  }, [pathname]);
  const getDirtyRevision = useCallback(() => dirtyRevision.current, []);
  const markSaved = useCallback((revision: number) => {
    if (dirtyRevision.current !== revision) return false;
    setDirtyState({ pathname, value: false });
    return true;
  }, [pathname]);
  const [toast, setToast] = useState<ToastState>(null);

  const showToast = useCallback(
    (title: string, message?: string, variant: ToastVariant = "success") => {
      setToast({ title, message, variant });
      window.setTimeout(() => setToast(null), variant === "error" ? 6000 : 3000);
    },
    []
  );

  const confirmLeave = useCallback(() => {
    if (!dirty) return true;
    return window.confirm(
      "変更が保存されていません。\nこのまま離れますか？"
    );
  }, [dirty]);

  useEffect(() => installUnsavedChangesGuard(() => dirty), [dirty]);

  const value = useMemo(
    () => ({ dirty, setDirty, getDirtyRevision, markSaved, showToast, confirmLeave }),
    [dirty, setDirty, getDirtyRevision, markSaved, showToast, confirmLeave]
  );

  return (
    <AdminUiContext.Provider value={value}>
      {children}
      {toast && (
        <div
          className={`admin-toast${toast.variant === "error" ? " admin-toast--error" : ""}`}
          role={toast.variant === "error" ? "alert" : "status"}
          aria-live={toast.variant === "error" ? "assertive" : "polite"}
        >
          {toast.variant === "error" ? (
            <AlertCircle size={16} strokeWidth={2.5} />
          ) : (
            <Check size={16} strokeWidth={2.5} />
          )}
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
