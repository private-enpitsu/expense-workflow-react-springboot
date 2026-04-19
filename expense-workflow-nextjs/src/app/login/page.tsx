"use client";

import { useSetAtom } from "jotai";
import { useRouter } from "next/navigation";
import { toastAtom } from "../../lib/atoms";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AxiosError } from "axios";
import { apiClient } from "../../lib/apiClient";
import styles from "./page.module.css";

export default function LoginPage() {
  const setToast = useSetAtom(toastAtom);
  const router = useRouter();
  const queryClient = useQueryClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiClient.post("/auth/login", { email, password });
      await queryClient.invalidateQueries({ queryKey: ["me"] });
      setToast({
        open: true,
        type: "success",
        message: "ログインに成功しました。",
      });
      router.replace("/");
    } catch (error) {
      const axiosError = error as AxiosError;
      const httpStatus = axiosError.response?.status ?? null;
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
      <h2 className={styles.title}>ログイン</h2>
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
    </div>
  );
}
