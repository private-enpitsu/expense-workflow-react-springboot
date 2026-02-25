/*
  ファイル: src/pages/RequestsListPage.jsx
  目的: 申請一覧をステータス別（DRAFT/SUBMITTED/APPROVED/RETURNED）の凸カードに分けて表示する
  呼び出し元/使用箇所: src/App.jsx の <Route path="/requests" element={<RequestsListPage />} />
  入力と出力: 入力なし / 出力=ステータス別セクション表示（0件でもカードは常に表示・中身は空）
  依存: TanStack Query / apiClient / React Router(Link) / statusLabel / CSS Modules + globals.css
  今回変更点: 全ステータスのカードを固定表示し、0件のカードは枠のみ（中身なし）にした
*/

import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { apiClient } from "../lib/apiClient";
import { toStatusLabel, toRequestLabel } from "../lib/statusLabel";
import styles from "./RequestsListPage.module.css";

/* ステータスの表示順と各セクションのバッジクラスを定義する */
const STATUS_SECTIONS = [
  { status: "RETURNED",  badgeClass: "badge badge-returned"  },
  { status: "DRAFT",     badgeClass: "badge badge-draft"     },
  { status: "SUBMITTED", badgeClass: "badge badge-submitted" },
  { status: "APPROVED",  badgeClass: "badge badge-approved"  },
  { status: "WITHDRAWN", badgeClass: "badge badge-withdrawn" },
  { status: "REJECTED",  badgeClass: "badge badge-rejected"  },
];

export default function RequestsListPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["requests"],
    queryFn: async () => {
      const res = await apiClient.get("/requests");
      return res.data;
    },
    refetchOnWindowFocus: false,
  });

  const httpStatus = error?.response?.status ?? null;
  const errorLabel = error
    ? httpStatus ? `HTTP ${httpStatus}` : String(error)
    : "";

  return (
    <div className={styles.page}>
      <h2 className={styles.title}>申請一覧</h2>

      {isLoading && <p className={styles.note}>Loading...</p>}
      {error    && <p className={styles.note}>Error: {errorLabel}</p>}

      {!isLoading && !error && Array.isArray(data) && (
        <>
          {STATUS_SECTIONS.map(({ status, badgeClass }) => {
            /* このステータスに該当する申請だけ抽出する */
            const items = data.filter((req) => req.status === status);

            return (
              <section key={status} className={styles.section}>

                {/* セクションヘッダ：バッジ＋件数 */}
                <div className={styles.sectionHeader}>
                  <span className={badgeClass}>{toStatusLabel(status)}</span>
                  <span className={styles.sectionCount}>{items.length}件</span>
                </div>

                {/* 申請行（凹インセット） */}
                {items.map((req) => (
                  <Link key={req.id} to={`/requests/${req.id}`} className={styles.item}>

                    {/* ID・金額 */}
                    <div className={styles.itemRow}>
                      <span className={styles.itemId}>
                        {toRequestLabel(req.id)}
                      </span>
                      <span className={styles.itemAmount}>
                        ¥{req.amount.toLocaleString()}
                      </span>
                    </div>

                    {/* 差戻しコメント（RETURNEDかつコメントありのみ） */}
                    {req.status === "RETURNED" && req.lastReturnComment && (
                      <div className={styles.returnComment}>
                        <span className={styles.returnCommentLabel}>差戻しコメント:</span>
                        {req.lastReturnComment}
                      </div>
                    )}

                  </Link>
                ))}

              </section>
            );
          })}
        </>
      )}
    </div>
  );
}
