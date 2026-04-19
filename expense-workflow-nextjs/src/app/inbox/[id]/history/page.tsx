"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Link from "next/link";
import { apiClient } from "@/lib/apiClient";
import { toActionLabel, toRequestLabel } from "@/lib/statusLabel";
import RequireAuth from "@/components/RequireAuth";
import styles from "./page.module.css";

function InboxHistoryContent() {
  const params = useParams();
  const requestId = params.id as string;

  const { data, isLoading, error } = useQuery({
    queryKey: ["inboxHistory", requestId],
    queryFn: async () => {
      const res = await apiClient.get(`/inbox/${requestId}/history`);
      return res.data;
    },
    enabled: Boolean(requestId),
  });

  return (
    <div className={styles.page}>
      <h2 className={styles.title}>操作履歴</h2>

      {isLoading && <p className={styles.loading}>読み込み中...</p>}
      {error && <p className={styles.error}>履歴の取得に失敗しました</p>}

      {data && (
        <>
          {data.length === 0 && (
            <p className={styles.empty}>履歴はありません</p>
          )}
          {data.map(
            (item: {
              id: number;
              action: string;
              requestStatus: string;
              comment: string | null;
              operatedAt: string;
              operatorName: string;
            }) => (
              <div key={item.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <span className={styles.action}>
                    {toActionLabel(item.action)}
                  </span>
                  <span className={styles.status}>
                    {toRequestLabel(item.requestStatus)}
                  </span>
                  <span className={styles.date}>
                    {new Date(item.operatedAt).toLocaleString("ja-JP")}
                  </span>
                </div>
                <div className={styles.operator}>{item.operatorName}</div>
                {item.comment && (
                  <div className={styles.comment}>{item.comment}</div>
                )}
              </div>
            ),
          )}
        </>
      )}

      <div className={styles.actions}>
        <Link href={`/inbox/${requestId}`} className={styles.btnBack}>
          詳細に戻る
        </Link>
      </div>
    </div>
  );
}

export default function InboxHistoryPage() {
  return (
    <RequireAuth>
      <InboxHistoryContent />
    </RequireAuth>
  );
}
