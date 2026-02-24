/*
  src/pages/InboxPage.jsx
  目的: 承認者向けの受信箱一覧。ニューモーフィズムデザインを適用した
  呼び出し元/使用箇所: src/App.jsx の <Route path="/inbox" element={<InboxPage />} />
  入力と出力: 入力なし / 出力=承認待ち申請の一覧（各行クリックで詳細へ遷移）
  今回変更点: table廃止・凹インセットカード行＋バッジ表示のニューモーフィズムデザインに変更した
*/

import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { apiClient } from "../lib/apiClient";
import { toStatusLabel, toRequestLabel } from "../lib/statusLabel";
import styles from "./InboxPage.module.css";

export default function InboxPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["inbox"],
    queryFn: async () => {
      const res = await apiClient.get("/inbox");
      return res.data;
    },
  });

  const errorLabel = error
    ? error?.response?.status ? `HTTP ${error.response.status}` : String(error)
    : "";

  return (
    <div className={styles.page}>
      <h2>受信箱</h2>

      {isLoading && <p className="state-loading">Loading...</p>}
      {error    && <p className="state-error">エラー：{errorLabel}</p>}

      {!isLoading && !error && Array.isArray(data) && data.length === 0 && (
        <p className={styles.empty}>承認待ちの申請はありません</p>
      )}

      {!isLoading && !error && Array.isArray(data) && data.map((item) => (
        <Link key={item.id} to={`/inbox/${item.id}`} className={styles.item}>
          <span className={styles.itemId}>{toRequestLabel(item.id)}</span>
          <span className={styles.itemTitle}>{item.title}</span>
          <span className={styles.itemAmount}>¥{item.amount.toLocaleString()}</span>
          <span className="badge badge-submitted">{toStatusLabel(item.status)}</span>
        </Link>
      ))}
    </div>
  );
}
