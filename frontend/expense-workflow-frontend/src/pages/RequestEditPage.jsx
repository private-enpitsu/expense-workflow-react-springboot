/*
  src/pages/RequestEditPage.jsx
  目的: /requests/:id/edit の「申請編集」ページ。RETURNED の申請だけ編集・再提出できる。ニューモーフィズムデザインを適用した
  呼び出し元/使用箇所: src/App.jsx の <Route path="/requests/:id/edit" element={<RequestEditPage />} />
  入力と出力: 入力=URLの :id / 出力=RETURNEDなら編集フォーム＋保存＋再提出、それ以外は案内表示
  今回変更点: ニューモーフィズムデザイン（凸カード・凹input・凸ボタン）を適用した
*/

import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSetAtom } from "jotai";

import { toastAtom } from "../lib/atoms";
import { apiClient } from "../lib/apiClient";
import { toStatusLabel, toRequestLabel } from "../lib/statusLabel";
import styles from "./RequestEditPage.module.css";

export default function RequestEditPage() {
  const { id: requestId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setToast = useSetAtom(toastAtom);

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [isEditStarted, setIsEditStarted] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["request", requestId],
    queryFn: async () => {
      const res = await apiClient.get(`/requests/${requestId}`);
      return res.data;
    },
    enabled: typeof requestId === "string" && requestId.length > 0,
  });

  /* data→state への初期コピー（1回のみ） */
  const ensureEditDraft = () => {
    if (!data || isEditStarted) return;
    setTitle(data.title ?? "");
    setAmount(String(data.amount ?? 0));
    setNote(data.note ?? "");
    setIsEditStarted(true);
  };

  const canEdit = Boolean(data && (data.status === "RETURNED" || data.status === "DRAFT"));
  const isReturned = Boolean(data && data.status === "RETURNED");

  const saveMutation = useMutation({
    mutationFn: async () => {
      ensureEditDraft();
      const t = isEditStarted ? title : (data?.title ?? "");
      const a = isEditStarted ? amount : String(data?.amount ?? 0);
      const n = isEditStarted ? note  : (data?.note ?? "");
      const numericAmount = Number(a);
      const safeAmount = Number.isFinite(numericAmount) ? numericAmount : 0;
      await apiClient.patch(`/requests/${requestId}`, { title: t, amount: safeAmount, note: n });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["request", requestId] });
      await queryClient.invalidateQueries({ queryKey: ["requests"] });
      setToast({ open: true, type: "success", message: "保存しました" });
    },
    onError: (err) => {
      const msg = err?.response?.status ? `HTTP ${err.response.status}` : String(err);
      setToast({ open: true, type: "error", message: `保存に失敗しました: ${msg}` });
    },
  });

  const resubmitMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post(`/requests/${requestId}/submit`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["requests"] });
      await queryClient.invalidateQueries({ queryKey: ["request", requestId] });
      await queryClient.invalidateQueries({ queryKey: ["inbox"] });
      setToast({ open: true, type: "success", message: "再提出しました" });
      navigate(`/requests/${requestId}`, { replace: true });
    },
    onError: (err) => {
      const msg = err?.response?.status ? `HTTP ${err.response.status}` : String(err);
      setToast({ open: true, type: "error", message: `再提出に失敗しました: ${msg}` });
    },
  });

  const isWorking = Boolean(saveMutation.isPending || resubmitMutation.isPending);
  const errorLabel = error
    ? error?.response?.status ? `HTTP ${error.response.status}` : String(error)
    : "";

  return (
    <div className={styles.page}>
      <h2>申請編集</h2>

      {isLoading && <p className="state-loading">Loading...</p>}
      {error    && <p className="state-error">エラー：{errorLabel}</p>}

      {!isLoading && !error && data && (
        <>
          {/* RETURNED以外かつDRAFT以外：編集不可の案内 */}
          {!canEdit && (
            <div className={styles.notEditable}>
              <p>この申請は下書き（DRAFT）または差戻し（RETURNED）のときだけ編集できます。</p>
              <p>現在の状態：{toStatusLabel(data.status)}</p>
            </div>
          )}

          {/* RETURNED：差戻しコメント表示 */}
          {isReturned && data.lastReturnComment && (
            <div className={styles.returnComment}>
              <span className={styles.returnCommentLabel}>差戻しコメント</span>
              <span className={styles.returnCommentValue}>{data.lastReturnComment}</span>
            </div>
          )}

          {/* DRAFT / RETURNED：編集フォーム */}
          {canEdit && (
            <div className={styles.card}>

              <label className={styles.field}>
                <span>件名</span>
                <input
                  value={isEditStarted ? title : (data.title ?? "")}
                  onFocus={() => ensureEditDraft()}
                  onChange={(e) => { ensureEditDraft(); setTitle(e.target.value); }}
                  disabled={isWorking}
                  placeholder="例）交通費精算"
                />
              </label>

              <label className={styles.field}>
                <span>金額</span>
                <input
                  value={isEditStarted ? amount : String(data.amount ?? 0)}
                  onFocus={() => ensureEditDraft()}
                  onChange={(e) => { ensureEditDraft(); setAmount(e.target.value); }}
                  disabled={isWorking}
                  inputMode="numeric"
                  placeholder="例）1200"
                />
              </label>

              <label className={styles.field}>
                <span>備考</span>
                <textarea
                  value={isEditStarted ? note : (data.note ?? "")}
                  onFocus={() => ensureEditDraft()}
                  onChange={(e) => { ensureEditDraft(); setNote(e.target.value); }}
                  disabled={isWorking}
                  rows={4}
                  placeholder="例）領収書あり"
                />
              </label>

            </div>
          )}

          {/* アクションボタン */}
          <div className={styles.actions}>
            {canEdit && (
              <>
                <button
                  type="button"
                  className={styles.btnSave}
                  onClick={() => saveMutation.mutate()}
                  disabled={isWorking}
                >
                  {saveMutation.isPending ? "保存中..." : "保存"}
                </button>
                <button
                  type="button"
                  className={styles.btnResubmit}
                  onClick={() => resubmitMutation.mutate()}
                  disabled={isWorking}
                >
                  {resubmitMutation.isPending ? "再提出中..." : "再提出"}
                </button>
              </>
            )}
            <Link to={`/requests/${requestId}`} className={styles.btnBack}>
              詳細に戻る
            </Link>
          </div>
        </>
      )}

      {!isLoading && !error && !data && (
        <p className="state-empty">データがありません</p>
      )}
    </div>
  );
}
