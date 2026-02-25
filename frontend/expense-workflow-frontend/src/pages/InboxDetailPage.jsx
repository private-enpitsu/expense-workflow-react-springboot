/*
  src/pages/InboxDetailPage.jsx
  目的: 承認者が /inbox/:id で申請詳細を確認し、承認・差戻しを実行できる画面。ニューモーフィズムデザインを適用した
  呼び出し元/使用箇所: src/App.jsx の <Route path="/inbox/:id" element={<InboxDetailPage />} />
  入力と出力: 入力=URLの :id / 出力=詳細表示＋承認ボタン＋差戻しコメント入力＋差戻しボタン
  今回変更点: ニューモーフィズムデザイン（凸カード・凹フィールド・凹テキストエリア・凸ボタン）を適用した
*/

import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSetAtom } from "jotai";

import { apiClient } from "../lib/apiClient";
import { toastAtom } from "../lib/atoms";
import { toStatusLabel, toRequestLabel } from "../lib/statusLabel";
import styles from "./InboxDetailPage.module.css";

/* ステータスに対応するバッジクラスを返す */
function statusBadgeClass(status) {
  const map = {
    DRAFT:     "badge badge-draft",
    SUBMITTED: "badge badge-submitted",
    APPROVED:  "badge badge-approved",
    RETURNED:  "badge badge-returned",
  };
  return map[status] ?? "badge";
}

export default function InboxDetailPage() {
  const { id: requestId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setToast = useSetAtom(toastAtom);

  const [returnComment, setReturnComment] = useState("");
  const [rejectComment, setRejectComment] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["requestDetailForInbox", requestId],
    queryFn: async () => {
      const res = await apiClient.get(`/inbox/${requestId}`);
      return res.data;
    },
    enabled: Boolean(requestId),
  });

  const approveMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post(`/requests/${requestId}/approve`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["inbox"] });
      await queryClient.invalidateQueries({ queryKey: ["requestDetailForInbox", requestId] });
      setToast({ open: true, type: "success", message: "承認しました" });
      navigate("/inbox", { replace: true });
    },
    onError: (e) => {
      const msg = e?.response?.status ? `HTTP ${e.response.status}` : String(e);
      setToast({ open: true, type: "error", message: `承認に失敗しました: ${msg}` });
    },
  });

  const returnMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post(`/requests/${requestId}/return`, { comment: returnComment });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["inbox"] });
      await queryClient.invalidateQueries({ queryKey: ["requestDetailForInbox", requestId] });
      setToast({ open: true, type: "success", message: "差戻しました" });
      navigate("/inbox", { replace: true });
    },
    onError: (e) => {
      const msg = e?.response?.status ? `HTTP ${e.response.status}` : String(e);
      setToast({ open: true, type: "error", message: `差戻しに失敗しました: ${msg}` });
    },
  });

  // 却下のミューテーションも同様に定義する（API呼び出しと成功・失敗時の処理をまとめる）
  const rejectMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post(
        `/requests/${requestId}/reject`,
        { comment: rejectComment }
      );
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries(
        { queryKey: ["inbox"] }
      );
      await queryClient.invalidateQueries({
        queryKey: ["requestDetailForInbox", requestId]
      });
      setToast({ open: true, type: "success",
                 message: "却下しました" });
      navigate("/inbox", { replace: true });
    },
    onError: (e) => {
      const msg = e?.response?.status
        ? `HTTP ${e.response.status}` : String(e);
      setToast({ open: true, type: "error",
                 message: `却下に失敗しました: ${msg}` });
    },
  });

  const canReject = Boolean(rejectComment.trim().length > 0);

  const isWorking = Boolean(
    approveMutation.isPending
    || returnMutation.isPending
    || rejectMutation.isPending
  );
  const canReturn = Boolean(returnComment.trim().length > 0);

  const errorLabel = error
    ? error?.response?.status ? `HTTP ${error.response.status}` : String(error)
    : "";

  return (
    <div className={styles.page}>
      <h2>受信箱：詳細</h2>

      {isLoading && <p className="state-loading">Loading...</p>}
      {error    && <p className="state-error">エラー：{errorLabel}</p>}
      {!isLoading && !error && !data && <p className="state-empty">データがありません</p>}

      {!isLoading && !error && data && (
        <>
          {/* 申請情報カード */}
          <div className={styles.card}>

            <div className={styles.field}>
              <span className={styles.fieldLabel}>申請ID</span>
              <span className={styles.fieldValue}>{toRequestLabel(requestId)}</span>
            </div>

            <div className={styles.field}>
              <span className={styles.fieldLabel}>件名</span>
              <span className={styles.fieldValue}>{data.title}</span>
            </div>

            <div className={styles.field}>
              <span className={styles.fieldLabel}>金額</span>
              <span className={styles.fieldValue}>¥{data.amount.toLocaleString()}</span>
            </div>

            <div className={styles.field}>
              <span className={styles.fieldLabel}>状態</span>
              <div className={styles.statusRow}>
                <span className={statusBadgeClass(data.status)}>
                  {toStatusLabel(data.status)}
                </span>
              </div>
            </div>

            <div className={styles.field}>
              <span className={styles.fieldLabel}>備考</span>
              <span className={styles.fieldValue}>{data.note || "―"}</span>
            </div>

          </div>

          {/* 承認ボタン */}
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.btnApprove}
              onClick={() => approveMutation.mutate()}
              disabled={isWorking}
            >
              {approveMutation.isPending ? "処理中..." : "承認"}
            </button>
          </div>

          {/* 差戻しセクション */}
          <div className={styles.returnSection}>
            <span className={styles.sectionTitle}>差戻しコメント（必須）</span>
            <textarea
              className={styles.returnTextarea}
              value={returnComment}
              onChange={(e) => setReturnComment(e.target.value)}
              placeholder="差戻し理由を入力してください"
              rows={4}
              disabled={isWorking}
            />
            <div className={styles.actions}>
              <button
                type="button"
                className={styles.btnReturn}
                onClick={() => returnMutation.mutate()}
                disabled={!canReturn || isWorking}
              >
                {returnMutation.isPending ? "処理中..." : "差戻す"}
              </button>
            </div>
          </div>

          {/* 却下セクション */}
          <div className={styles.rejectSection}>
            <span className={styles.sectionTitle}>
              却下コメント（必須）
            </span>
            <textarea
              className={styles.rejectTextarea}
              value={rejectComment}
              onChange={(e) => setRejectComment(e.target.value)}
              placeholder="却下理由を入力してください"
              rows={4}
              disabled={isWorking}
            />
            <div className={styles.actions}>
              <button
                type="button"
                className={styles.btnReject}
                onClick={() => rejectMutation.mutate()}
                disabled={!canReject || isWorking}
              >
                {rejectMutation.isPending
                  ? "処理中..." : "却下"}
              </button>
            </div>
          </div>

          {/* 一覧に戻る */}
          <div className={styles.actions}>
            <Link to="/inbox" className={styles.btnBack}>
              一覧に戻る
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
