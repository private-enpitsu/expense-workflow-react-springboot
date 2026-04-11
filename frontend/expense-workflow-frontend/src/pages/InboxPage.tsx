/*
  承認者向けの受信箱一覧
*/

import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";

import { apiClient } from "../lib/apiClient";
import { toStatusLabel, toRequestLabel, StatusCode } from "../lib/statusLabel";
import styles from "./InboxPage.module.css";

// バックエンドの InboxItemResponse DTO に対応する型
type InboxItem = {
  id: number;
  title: string;
  amount: number;
  status: StatusCode;
};

type InboxSection = {
  status: StatusCode;
  badgeClass: string;
};

// セクション定義：表示順・バッジクラスを一元管理する
const INBOX_SECTIONS: InboxSection[] = [
  { status: "SUBMITTED", badgeClass: "badge badge-submitted" },
  { status: "RETURNED", badgeClass: "badge badge-returned" },
  { status: "APPROVED", badgeClass: "badge badge-approved" },
  { status: "REJECTED", badgeClass: "badge badge-rejected" },
];

export default function InboxPage() {
  const { data, isLoading, error } = useQuery<InboxItem[], AxiosError>({
    queryKey: ["inbox"],
    queryFn: async () => {
      const res = await apiClient.get<InboxItem[]>("/inbox");
      return res.data;
    },
  });

  const errorLabel = error
    ? error?.response?.status
      ? `HTTP ${error.response.status}`
      : String(error)
    : "";

  return (
    <div className={styles.page}>
      <h2>受信箱</h2>

      {isLoading && <p className="state-loading">Loading...</p>}
      {error && <p className="state-error">エラー：{errorLabel}</p>}

      {!isLoading && !error && Array.isArray(data) && (
        <>
          {INBOX_SECTIONS.map(({ status, badgeClass }) => {
            const items = data.filter((item) => item.status === status);
            if (items.length === 0) return null;
            return (
              <section key={status} className={styles.section}>
                <div className={styles.sectionHeader}>
                  <span className={badgeClass}>{toStatusLabel(status)}</span>
                </div>
                {items.map((item) => (
                  <Link
                    key={item.id}
                    to={`/inbox/${item.id}`}
                    className={styles.item}
                  >
                    <span className={styles.itemId}>
                      {toRequestLabel(item.id)}
                    </span>
                    <span className={styles.itemTitle}>{item.title}</span>
                    <span className={styles.itemAmount}>
                      ¥{item.amount.toLocaleString()}
                    </span>
                  </Link>
                ))}
              </section>
            );
          })}
          {data.length === 0 && (
            <p className={styles.empty}>申請はありません</p>
          )}
        </>
      )}
    </div>
  );
}
