"use client";
import {confirmBeforeLeaving} from "@/lib/browser/unsaved-changes";

import { LogOut } from "lucide-react";
import { useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export async function signOutOperator(): Promise<boolean> {
  if (!confirmBeforeLeaving()) return false;
  try {
    const {error} = await createBrowserSupabaseClient().auth.signOut();
    if (error) throw error;
    window.location.assign("/login");
    return true;
  } catch { window.alert("ログアウトできませんでした。通信を確認して、もう一度お試しください。"); return false; }
}

export function OperatorAccountMenu({ email }: { email: string | null }) {
  const [signingOut, setSigningOut] = useState(false);

  const handleLogout = () => {
    if (signingOut) return;
    setSigningOut(true);
    void signOutOperator().then(() => setSigningOut(false));
  };

  return (
    <div className="admin-account">
      {email ? (
        <span className="admin-account-email" title={email}>
          {email}
        </span>
      ) : null}
      <button
        type="button"
        className="admin-btn admin-btn--ghost"
        onClick={handleLogout}
        disabled={signingOut}
      >
        <LogOut size={14} strokeWidth={1.75} />
        {signingOut ? "ログアウト中…" : "ログアウト"}
      </button>
    </div>
  );
}
