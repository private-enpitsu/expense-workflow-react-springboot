/*
  src/pages/RequestCreatePage.jsx
  目的: /requests/new の「申請作成」ページ。ニューモーフィズムデザインを適用した
  呼び出し元/使用箇所: src/App.jsx の <Route path="/requests/new" element={<RequestCreatePage />} />
  入力と出力: Props なし / 出力=申請作成フォーム（保存・提出ボタン付き）
  依存: react / react-router-dom / @tanstack/react-query / jotai / apiClient / statusLabel / CSS Modules
  今回変更点: 入力欄・ボタンにニューモーフィズムデザイン（凹input・凸button）を適用した
*/

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSetAtom } from "jotai";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toastAtom } from "../lib/atoms";
import { apiClient } from "../lib/apiClient";
import { toRequestLabel } from "../lib/statusLabel";

import styles from "./RequestCreatePage.module.css";

export default function RequestCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setToast = useSetAtom(toastAtom);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const createMutation = useMutation({
    mutationFn: async () => {
      const amountNumber = Number(amount || 0);
      const body = { title, amount: amountNumber, note };
      const res = await apiClient.post("/requests", body);
      return res.data;
    },
    onSuccess: async (created) => {
      await queryClient.invalidateQueries({ queryKey: ["requests"] });
      setToast({ open: true, type: "success", message: `保存しました: ${toRequestLabel(created?.id)}` });
      navigate(created?.id ? `/requests/${created.id}` : "/requests", { replace: true });
    },
    onError: (error) => {
      const status = error?.response?.status ?? null;
      const msg = status ? `HTTP ${status}` : String(error);
      setToast({ open: true, type: "error", message: `保存に失敗しました: ${msg}` });
    },
  });

  const submitNewMutation = useMutation({
    mutationFn: async () => {
      const amountNumber = Number(amount || 0);
      const body = { title, amount: amountNumber, note };
      const createdRes = await apiClient.post("/requests", body);
      const created = createdRes.data;
      const newId = created?.id ?? null;
      if (!newId) throw new Error("created.id is missing");
      await apiClient.post(`/requests/${newId}/submit`);
      return { id: newId };
    },
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ["requests"] });
      await queryClient.invalidateQueries({ queryKey: ["inbox"] });
      setToast({ open: true, type: "success", message: `提出しました: ${toRequestLabel(result?.id)}` });
      navigate(result?.id ? `/requests/${result.id}` : "/requests", { replace: true });
    },
    onError: (error) => {
      const status = error?.response?.status ?? null;
      const msg = status ? `HTTP ${status}` : String(error);
      setToast({ open: true, type: "error", message: `提出に失敗しました: ${msg}` });
    },
  });

  const isSubmitting = Boolean(createMutation.isPending || submitNewMutation.isPending);
  const canSubmit = Boolean(title.trim().length > 0);

  return (
    <div className={styles.container}>
      <h2>申請作成</h2>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!canSubmit) return;
          createMutation.mutate();
        }}
        className={styles.form}
      >
        <ul>
          <li>
            <label className={styles.field}>
              <span>件名</span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isSubmitting}
                placeholder="例）交通費精算"
              />
            </label>
          </li>

          <li>
            <label className={styles.field}>
              <span>金額</span>
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={isSubmitting}
                placeholder="例）1200"
                inputMode="numeric"
              />
            </label>
          </li>

          <li>
            <label className={styles.field}>
              <span>備考</span>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                disabled={isSubmitting}
                placeholder="例）領収書あり"
                rows={4}
              />
            </label>
          </li>
        </ul>

        <div className={styles.actions}>
          <button
            type="submit"
            className={styles.btnSave}
            disabled={isSubmitting || !canSubmit}
          >
            {isSubmitting ? "処理中..." : "保存"}
          </button>

          <button
            type="button"
            className={styles.btnSubmit}
            disabled={isSubmitting || !canSubmit}
            onClick={() => submitNewMutation.mutate()}
          >
            {isSubmitting ? "処理中..." : "提出"}
          </button>
        </div>
      </form>
    </div>
  );
}
