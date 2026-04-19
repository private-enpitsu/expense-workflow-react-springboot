"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSetAtom } from "jotai";
import { AxiosError } from "axios";
import { apiClient } from "../../../lib/apiClient";
import { toastAtom } from "../../../lib/atoms";
import {
  toStatusLabel,
  toRequestLabel,
  StatusCode,
} from "../../../lib/statusLabel";
import RequireAuth from "../../../components/RequireAuth";
import styles from "./page.module.css";

type InboxDetail = {
  id: number;
  title: string;
  amount: number;
  status: StatusCode;
  note?: string;
};

function toErrorMsg(e: unknown): string {
  const axiosError = e as AxiosError;
  return axiosError?.response?.status
    ? `HTTP ${axiosError.response.status}`
    : String(e);
}

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

function InboxDetailContent() {
  const { id: requestId } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const setToast = useSetAtom(toastAtom);

  const [returnComment, setReturnComment] = useState("");
  const [rejectComment, setRejectComment] = useState("");

  const { data, isLoading, error } = useQuery<InboxDetail, AxiosError>({
    queryKey: ["requestDetailForInbox", requestId],
    queryFn: async () => {
      const res = await apiClient.get<InboxDetail>(`/inbox/${requestId}`);
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
      await queryClient.invalidateQueries({
        queryKey: ["requestDetailForInbox", requestId],
      });
      setToast({ open: true, type: "success", message: "承認しました" });
      router.replace("/inbox");
    },
    onError: (e: unknown) => {
      setToast({
        open: true,
        type: "error",
        message: `承認に失敗しました: ${toErrorMsg(e)}`,
      });
    },
  });

  const returnMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post(`/requests/${requestId}/return`, {
        comment: returnComment,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["inbox"] });
      await queryClient.invalidateQueries({
        queryKey: ["requestDetailForInbox", requestId],
      });
      setToast({ open: true, type: "success", message: "差戻しました" });
      router.replace("/inbox");
    },
    onError: (e: unknown) => {
      setToast({
        open: true,
        type: "error",
        message: `差戻しに失敗しました: ${toErrorMsg(e)}`,
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post(`/requests/${requestId}/reject`, {
        comment: rejectComment,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["inbox"] });
      await queryClient.invalidateQueries({
        queryKey: ["requestDetailForInbox", requestId],
      });
      setToast({ open: true, type: "success", message: "却下しました" });
      router.replace("/inbox");
    },
    onError: (e: unknown) => {
      setToast({
        open: true,
        type: "error",
        message: `却下に失敗しました: ${toErrorMsg(e)}`,
      });
    },
  });

  const canReturn = Boolean(returnComment.trim().length > 0);
  const canReject = Boolean(rejectComment.trim().length > 0);
  const isWorking = Boolean(
    approveMutation.isPending ||
    returnMutation.isPending ||
    rejectMutation.isPending,
  );
  const errorLabel = error
    ? error?.response?.status
      ? `HTTP ${error.response.status}`
      : String(error)
    : "";

  return (
    <div className={styles.page}>
      <h2>受信箱：詳細</h2>
      {isLoading && <p>Loading...</p>}
      {error && <p>エラー：{errorLabel}</p>}
      {!isLoading && !error && !data && <p>データがありません</p>}
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
          <div className={styles.rejectSection}>
            <span className={styles.sectionTitle}>却下コメント（必須）</span>
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
                {rejectMutation.isPending ? "処理中..." : "却下"}
              </button>
            </div>
          </div>
          <div className={styles.actions}>
            <Link
              href={`/inbox/${requestId}/history`}
              className={styles.btnHistory}
            >
              履歴を見る
            </Link>
            <Link href="/inbox" className={styles.btnBack}>
              一覧に戻る
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

export default function InboxDetailPage() {
  return (
    <RequireAuth>
      <InboxDetailContent />
    </RequireAuth>
  );
}
