"use client";

import { useState, type FormEvent } from "react";
import { SakupageLogo } from "@/components/admin/SakupageLogo";
import { BRAND } from "@/lib/admin/brand";
import { isOperatorUser } from "@/lib/auth/operator-role";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type OperatorLoginFormProps = {
  nextPath: string;
  forbidden: boolean;
};

const FORBIDDEN_MESSAGE = "このアカウントには管理画面へのアクセス権限がありません。";

export function OperatorLoginForm({ nextPath, forbidden }: OperatorLoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(forbidden ? FORBIDDEN_MESSAGE : null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    if (!email.trim() || !password) {
      setError("メールアドレスとパスワードを入力してください。");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const supabase = createBrowserSupabaseClient();
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError || !data.user) {
        setError(
          signInError?.code === "invalid_credentials" || signInError?.status === 400
            ? "メールアドレスまたはパスワードが正しくありません。"
            : "ログインに失敗しました。時間をおいて再度お試しください。"
        );
        setSubmitting(false);
        return;
      }

      if (!isOperatorUser(data.user)) {
        await supabase.auth.signOut();
        setError(FORBIDDEN_MESSAGE);
        setSubmitting(false);
        return;
      }

      window.location.assign(nextPath);
    } catch {
      setError("ログインに失敗しました。通信状況を確認して再度お試しください。");
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-root admin-login-page">
      <main className="admin-login-card">
        <div className="admin-login-brand">
          <SakupageLogo variant="header" />
          <p className="admin-login-subtitle">{BRAND.operatorPanelTitle}</p>
        </div>

        <h1 className="admin-login-title">運営者ログイン</h1>

        <form className="admin-login-form" onSubmit={handleSubmit} noValidate>
          <div className="admin-form-group">
            <label className="admin-form-label" htmlFor="login-email">
              メールアドレス
            </label>
            <input
              id="login-email"
              type="email"
              className="admin-form-input"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
              required
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label" htmlFor="login-password">
              パスワード
            </label>
            <input
              id="login-password"
              type="password"
              className="admin-form-input"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting}
              required
            />
          </div>

          {error ? (
            <p className="admin-login-error" role="alert">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            className="admin-btn admin-btn--primary admin-login-submit"
            disabled={submitting}
          >
            {submitting ? "ログイン中…" : "ログイン"}
          </button>
        </form>
      </main>
    </div>
  );
}
