"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AxiosError } from "axios";
import { apiClient } from "../../../../lib/apiClient";
import {
  toActionLabel,
  toRequestLabel,
  ActionCode,
} from "../../../../lib/statusLabel";
import RequireAuth from "../../../../components/RequireAuth";
import styles from "./page.module.css";

type HistoryItem = {
  action: ActionCode;
  actorName: string;
  createdAt: string;
  comment?: string;
};

function RequestHistoryContent() {
  const { id: requestId } = useParams<{ id: string }>();

  const { data, isLoading, error } = useQuery<HistoryItem[], AxiosError>({
    queryKey: ["requestHistory", requestId],
    queryFn: async () => {
      const res = await apiClient.get<HistoryItem[]>(
        `/requests/${requestId}/history`,
      );
      return res.data;
    },
    enabled: Boolean(requestId),
  });

  return (
    <div className={styles.page}>
      <h2>操作履歴</h2>
      <p className={styles.requestId}>{toRequestLabel(requestId)}</p>
      {isLoading && <p>Loading...</p>}
      {error && <p>エラーが発生しました</p>}
      {!isLoading && !error && data && (
        <div className={styles.list}>
          {data.length === 0 && <p>履歴がありません</p>}
          {data.map((item, i) => (
            <div key={i} className={styles.item}>
              <span className={styles.action}>
                {toActionLabel(item.action)}
              </span>
              <span className={styles.actor}>{item.actorName}</span>
              <span className={styles.date}>{item.createdAt}</span>
              {item.comment && (
                <span className={styles.comment}>{item.comment}</span>
              )}
            </div>
          ))}
        </div>
      )}
      <div className={styles.actions}>
        <Link href={`/requests/${requestId}`} className={styles.btnBack}>
          詳細に戻る
        </Link>
      </div>
    </div>
  );
}

export default function RequestHistoryPage() {
  return (
    <RequireAuth>
      <RequestHistoryContent />
    </RequireAuth>
  );
}
