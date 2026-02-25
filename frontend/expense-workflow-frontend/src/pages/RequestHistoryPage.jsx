/*
  目的：申請者が操作履歴を確認する画面
  URL：/requests/:id/history
  呼び出し元：App.jsx の Route
  依存：TanStack Query / apiClient / statusLabel / CSS Modules
*/
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { apiClient } from "../lib/apiClient";
import { toActionLabel, toRequestLabel } from "../lib/statusLabel";
import styles from "./RequestHistoryPage.module.css";

export default function RequestHistoryPage() {
  const { id: requestId } = useParams();

  const { data, isLoading, error } = useQuery({
    queryKey: ["requestHistory", requestId],
    queryFn: async () => {
      const res = await apiClient.get(
        `/requests/${requestId}/history`
      );
      return res.data;
    },
    enabled: Boolean(requestId),
  });

  return (
    <div className={styles.page}>
      <h2>操作履歴</h2>
      <p className={styles.requestId}>
        {toRequestLabel(requestId)}
      </p>

      {isLoading && (
        <p className="state-loading">Loading...</p>
      )}
      {error && (
        <p className="state-error">エラーが発生しました</p>
      )}

      {!isLoading && !error && data && (
        <div className={styles.list}>
          {data.length === 0 && (
            <p className="state-empty">履歴がありません</p>
          )}
          {data.map((item, i) => (
            <div key={i} className={styles.item}>
              <span className={styles.action}>
                {toActionLabel(item.action)}
              </span>
              <span className={styles.actor}>
                {item.actorName}
              </span>
              <span className={styles.date}>
                {item.createdAt}
              </span>
              {item.comment && (
                <span className={styles.comment}>
                  {item.comment}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      <div className={styles.actions}>
        <Link
          to={`/requests/${requestId}`}
          className={styles.btnBack}
        >
          詳細に戻る
        </Link>
      </div>
    </div>
  );
}