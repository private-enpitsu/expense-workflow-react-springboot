"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useSetAtom } from "jotai";
import { AxiosError } from "axios";
import { toastAtom } from "../../../lib/atoms";
import { apiClient } from "../../../lib/apiClient";
import {
  toStatusLabel,
  toRequestLabel,
  StatusCode,
} from "../../../lib/statusLabel";
import RequireAuth from "../../../components/RequireAuth";
import styles from "./page.module.css";

type RequestAction = {
  action: string;
  comment?: string;
};

type RequestDetail = {
  id: number;
  title: string;
  amount: number;
  status: StatusCode;
  note?: string;
  lastReturnComment?: string;
  actions?: RequestAction[];
};

function statusBadgeClass(status: StatusCode): string {
  const map: Record<StatusCode, string> = {
    DRAFT: "badge badge-draft",
    SUBMITTED: "badge badge-submitted",
    APPROVED: "badge badge-approved",
    RETURNED: "badge badge-returned",
    WITHDRAWN: "badge badge-withdrawn",
    REJECTED: "badge badge-rejected",
  };
  return map[status] ?? "badge";
}

function RequestDetailContent() {
  const { id: requestId } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const setToast = useSetAtom(toastAtom);

  const withdrawMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post(`/requests/${requestId}/withdraw`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["requests"] });
      await queryClient.invalidateQueries({ queryKey: ["request", requestId] });
      setToast({ open: true, type: "success", message: "取り下げました" });
      router.replace("/requests");
    },
    onError: (e: unknown) => {
      const axiosError = e as AxiosError;
      const msg = axiosError?.response?.status
        ? `HTTP ${axiosError.response.status}`
        : String(e);
      setToast({
        open: true,
        type: "error",
        message: `取り下げに失敗しました: ${msg}`,
      });
    },
  });

  const { data, isLoading, error } = useQuery<RequestDetail, AxiosError>({
    queryKey: ["request", requestId],
    queryFn: async () => {
      const res = await apiClient.get<RequestDetail>(`/requests/${requestId}`);
      return res.data;
    },
    enabled: typeof requestId === "string" && requestId.length > 0,
  });

  const errorLabel = error
    ? error.response?.status
      ? `HTTP ${error.response.status}`
      : String(error)
    : "";

  const canEdit = Boolean(
    data && (data.status === "RETURNED" || data.status === "DRAFT"),
  );
  const canWithdraw = Boolean(
    data && (data.status === "DRAFT" || data.status === "RETURNED"),
  );
  const isReturned = Boolean(data && data.status === "RETURNED");

  return (
    <div className={styles.page}>
      <h2>申請詳細</h2>
      {isLoading && <p>Loading...</p>}
      {error && <p>エラー：{errorLabel}</p>}
      {!isLoading && !error && data && (
        <>
          <div className={styles.card}>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>申請ID</span>
              <span className={styles.fieldValue}>
                {toRequestLabel(requestId)}
              </span>
            </div>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>件名</span>
              <span className={styles.fieldValue}>{data.title}</span>
            </div>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>金額</span>
              <span className={styles.fieldValue}>
                ¥{data.amount.toLocaleString()}
              </span>
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
          {isReturned && data.lastReturnComment && (
            <div className={styles.returnComment}>
              <span className={styles.returnCommentLabel}>差戻しコメント</span>
              <span className={styles.returnCommentValue}>
                {data.lastReturnComment}
              </span>
            </div>
          )}
          {data.status === "REJECTED" &&
            (() => {
              const rejectComment = data.actions?.findLast(
                (a: RequestAction) => a.action === "REJECT",
              )?.comment;
              return rejectComment ? (
                <div className={styles.returnComment}>
                  <span className={styles.returnCommentLabel}>
                    却下コメント
                  </span>
                  <span className={styles.returnCommentValue}>
                    {rejectComment}
                  </span>
                </div>
              ) : null;
            })()}
          <div className={styles.actions}>
            {canEdit && (
              <Link
                href={`/requests/${requestId}/edit`}
                className={styles.btnEdit}
              >
                修正する
              </Link>
            )}
            {canWithdraw && (
              <button
                type="button"
                className={styles.btnWithdraw}
                onClick={() => withdrawMutation.mutate()}
                disabled={withdrawMutation.isPending}
              >
                {withdrawMutation.isPending ? "処理中..." : "取り下げ"}
              </button>
            )}
            <Link
              href={`/requests/${requestId}/history`}
              className={styles.btnHistory}
            >
              履歴を見る
            </Link>
            <Link href="/requests" className={styles.btnBack}>
              一覧に戻る
            </Link>
          </div>
        </>
      )}
      {!isLoading && !error && !data && <p>データがありません</p>}
    </div>
  );
}

export default function RequestDetailPage() {
  return (
    <RequireAuth>
      <RequestDetailContent />
    </RequireAuth>
  );
}
