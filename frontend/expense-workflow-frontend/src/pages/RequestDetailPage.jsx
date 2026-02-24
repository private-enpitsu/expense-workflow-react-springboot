/*
  src/pages/RequestDetailPage.jsx
  目的: /requests/:id の「申請詳細」ページ。ニューモーフィズムデザインを適用した
  呼び出し元/使用箇所: src/App.jsx の <Route path="/requests/:id" element={<RequestDetailPage />} />
  入力と出力: 入力=URLの :id / 出力=詳細表示（RETURNED時のみ差戻しコメント＋修正ボタン）
  今回変更点: ニューモーフィズムデザイン（凸カード・凹フィールド・凸ボタン）を適用した
*/

import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";

import { apiClient } from "../lib/apiClient";
import { toStatusLabel, toRequestLabel } from "../lib/statusLabel";
import styles from "./RequestDetailPage.module.css";

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

export default function RequestDetailPage() {
  const { id: requestId } = useParams();

  const { data, isLoading, error } = useQuery({
    queryKey: ["request", requestId],
    queryFn: async () => {
      const res = await apiClient.get(`/requests/${requestId}`);
      return res.data;
    },
    enabled: typeof requestId === "string" && requestId.length > 0,
  });

  const errorLabel = error
    ? error.response?.status ? `HTTP ${error.response.status}` : String(error)
    : "";

  const canEditReturned = Boolean(data && data.status === "RETURNED");

  return (
    <div className={styles.page}>
      <h2>申請詳細</h2>

      {isLoading && <p className="state-loading">Loading...</p>}
      {error    && <p className="state-error">エラー：{errorLabel}</p>}

      {!isLoading && !error && data && (
        <>
          <div className={styles.card}>

            {/* 申請ID */}
            <div className={styles.field}>
              <span className={styles.fieldLabel}>申請ID</span>
              <span className={styles.fieldValue}>{toRequestLabel(requestId)}</span>
            </div>

            {/* 件名 */}
            <div className={styles.field}>
              <span className={styles.fieldLabel}>件名</span>
              <span className={styles.fieldValue}>{data.title}</span>
            </div>

            {/* 金額 */}
            <div className={styles.field}>
              <span className={styles.fieldLabel}>金額</span>
              <span className={styles.fieldValue}>¥{data.amount.toLocaleString()}</span>
            </div>

            {/* 状態 */}
            <div className={styles.field}>
              <span className={styles.fieldLabel}>状態</span>
              <div className={styles.statusRow}>
                <span className={statusBadgeClass(data.status)}>
                  {toStatusLabel(data.status)}
                </span>
              </div>
            </div>

            {/* 備考 */}
            <div className={styles.field}>
              <span className={styles.fieldLabel}>備考</span>
              <span className={styles.fieldValue}>{data.note || "―"}</span>
            </div>

          </div>

          {/* 差戻しコメント（RETURNEDかつコメントありのみ） */}
          {canEditReturned && data.lastReturnComment && (
            <div className={styles.returnComment}>
              <span className={styles.returnCommentLabel}>差戻しコメント</span>
              <span className={styles.returnCommentValue}>{data.lastReturnComment}</span>
            </div>
          )}

          {/* アクションボタン */}
          <div className={styles.actions}>
            {canEditReturned && (
              <Link to={`/requests/${requestId}/edit`} className={styles.btnEdit}>
                修正する
              </Link>
            )}
            <Link to="/requests" className={styles.btnBack}>
              一覧に戻る
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
