"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { apiClient } from "../../lib/apiClient";
import {
  toStatusLabel,
  toRequestLabel,
  StatusCode,
} from "../../lib/statusLabel";
import RequireAuth from "../../components/RequireAuth";
import styles from "./page.module.css";

type RequestSummary = {
  id: number;
  title: string;
  amount: number;
  status: StatusCode;
  lastReturnComment?: string;
};

type StatusSection = {
  status: StatusCode;
  badgeClass: string;
};

const STATUS_SECTIONS: StatusSection[] = [
  { status: "RETURNED", badgeClass: "badge badge-returned" },
  { status: "DRAFT", badgeClass: "badge badge-draft" },
  { status: "SUBMITTED", badgeClass: "badge badge-submitted" },
  { status: "APPROVED", badgeClass: "badge badge-approved" },
  { status: "WITHDRAWN", badgeClass: "badge badge-withdrawn" },
  { status: "REJECTED", badgeClass: "badge badge-rejected" },
];

function RequestsListContent() {
  const { data, isLoading, error } = useQuery<RequestSummary[], AxiosError>({
    queryKey: ["requests"],
    queryFn: async () => {
      const res = await apiClient.get<RequestSummary[]>("/requests");
      return res.data;
    },
    refetchOnWindowFocus: false,
  });

  const httpStatus = error?.response?.status ?? null;
  const errorLabel = error
    ? httpStatus
      ? `HTTP ${httpStatus}`
      : String(error)
    : "";

  return (
    <div className={styles.page}>
      <h2 className={styles.title}>申請一覧</h2>
      {isLoading && <p className={styles.note}>Loading...</p>}
      {error && <p className={styles.note}>Error: {errorLabel}</p>}
      {!isLoading && !error && Array.isArray(data) && (
        <>
          {STATUS_SECTIONS.map(({ status, badgeClass }) => {
            const items = data.filter((req) => req.status === status);
            return (
              <section key={status} className={styles.section}>
                <div className={styles.sectionHeader}>
                  <span className={badgeClass}>{toStatusLabel(status)}</span>
                  <span className={styles.sectionCount}>{items.length}件</span>
                </div>
                {items.map((req) => (
                  <Link
                    key={req.id}
                    href={`/requests/${req.id}`}
                    className={styles.item}
                  >
                    <div className={styles.itemRow}>
                      <span className={styles.itemId}>
                        {toRequestLabel(req.id)}
                      </span>
                      <span className={styles.itemTitle}>{req.title}</span>
                      <span className={styles.itemAmount}>
                        ¥{req.amount.toLocaleString()}
                      </span>
                    </div>
                    {req.status === "RETURNED" && req.lastReturnComment && (
                      <div className={styles.returnComment}>
                        <span className={styles.returnCommentLabel}>
                          差戻しコメント:
                        </span>
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

export default function RequestsListPage() {
  return (
    <RequireAuth>
      <RequestsListContent />
    </RequireAuth>
  );
}
