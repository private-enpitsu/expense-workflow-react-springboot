// [目的] /login で「ログインフォーム送信 → セッション確立 → ログイン後に元の画面へ戻る」を実装する
// [呼び出し元] App.jsx の <Route path="/login" element={<LoginPage />} />
// [変更点] スタイルをニューモーフィズムデザインに合わせて更新

import { useAtomValue, useSetAtom } from "jotai";
import { useLocation, useNavigate } from "react-router-dom";
import { healthSnapshotAtom, toastAtom } from "../lib/atoms";
import styles from "./LoginPage.module.css";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { apiClient } from "./../lib/apiClient";

export default function LoginPage() {
  const healthSnapshot = useAtomValue(healthSnapshotAtom);
  const location = useLocation();
  const setToast = useSetAtom(toastAtom);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const fromPathname = location.state?.from?.pathname || "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiClient.post("/auth/login", { email, password });
      await queryClient.invalidateQueries(["me"]);
      setToast({ open: true, type: "success", message: "ログインに成功しました。" });
      navigate(fromPathname, { replace: true });
    } catch (error) {
      const httpStatus = error.response?.status ?? null;
      const message =
        httpStatus === 401
          ? "メールアドレスまたはパスワードが正しくありません（401）"
          : "ログインに失敗しました。";
      setToast({ open: true, type: "error", message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>ログイン</h1>
      <p className={styles.sub}>経費申請システムにログインしてください</p>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div>
          <label className={styles.label}>Email</label>
          <input
            className={styles.input}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
            placeholder="example@company.com"
          />
        </div>

        <div>
          <label className={styles.label}>Password</label>
          <input
            className={styles.input}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isSubmitting}
            placeholder="••••••••"
          />
        </div>

        <button className={styles.btn} type="submit" disabled={isSubmitting}>
          {isSubmitting ? "ログイン中..." : "ログイン"}
        </button>
      </form>

      {/* デバッグ情報（開発中のみ） */}
      <p className={styles.debugInfo}>
        戻り先: {fromPathname}　／　Last Health: {healthSnapshot.status}
      </p>
    </div>
  );
}
