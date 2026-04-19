"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSetAtom } from "jotai";
import { AxiosError } from "axios";
import { toastAtom } from "../../../../lib/atoms";
import { apiClient } from "../../../../lib/apiClient";
import { toStatusLabel, StatusCode } from "../../../../lib/statusLabel";
import RequireAuth from "../../../../components/RequireAuth";
import styles from "./page.module.css";

type RequestDetail = {
  id: number;
  title: string;
  amount: number;
  status: StatusCode;
  note?: string;
  lastReturnComment?: string;
};

function toErrorMsg(e: unknown): string {
  const axiosError = e as AxiosError;
  return axiosError?.response?.status
    ? `HTTP ${axiosError.response.status}`
    : String(e);
}

function RequestEditContent() {
  const { id: requestId } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const setToast = useSetAtom(toastAtom);

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [isEditStarted, setIsEditStarted] = useState(false);

  const { data, isLoading, error } = useQuery<RequestDetail, AxiosError>({
    queryKey: ["request", requestId],
    queryFn: async () => {
      const res = await apiClient.get<RequestDetail>(`/requests/${requestId}`);
      return res.data;
    },
    enabled: typeof requestId === "string" && requestId.length > 0,
  });

  const ensureEditDraft = () => {
    if (!data || isEditStarted) return;
    setTitle(data.title ?? "");
    setAmount(String(data.amount ?? 0));
    setNote(data.note ?? "");
    setIsEditStarted(true);
  };

  const canEdit = Boolean(
    data && (data.status === "RETURNED" || data.status === "DRAFT"),
  );
  const isReturned = Boolean(data && data.status === "RETURNED");

  const saveMutation = useMutation({
    mutationFn: async () => {
      ensureEditDraft();
      const t = isEditStarted ? title : (data?.title ?? "");
      const a = isEditStarted ? amount : String(data?.amount ?? 0);
      const n = isEditStarted ? note : (data?.note ?? "");
      const numericAmount = Number(a);
      const safeAmount = Number.isFinite(numericAmount) ? numericAmount : 0;
      await apiClient.patch(`/requests/${requestId}`, {
        title: t,
        amount: safeAmount,
        note: n,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["request", requestId] });
      await queryClient.invalidateQueries({ queryKey: ["requests"] });
      setToast({ open: true, type: "success", message: "保存しました" });
    },
    onError: (e: unknown) => {
      setToast({
        open: true,
        type: "error",
        message: `保存に失敗しました: ${toErrorMsg(e)}`,
      });
    },
  });

  const resubmitMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post(`/requests/${requestId}/submit`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["requests"] });
      await queryClient.invalidateQueries({ queryKey: ["request", requestId] });
      await queryClient.invalidateQueries({ queryKey: ["inbox"] });
      setToast({ open: true, type: "success", message: "再提出しました" });
      router.replace(`/requests/${requestId}`);
    },
    onError: (e: unknown) => {
      setToast({
        open: true,
        type: "error",
        message: `再提出に失敗しました: ${toErrorMsg(e)}`,
      });
    },
  });

  const isWorking = Boolean(
    saveMutation.isPending || resubmitMutation.isPending,
  );
  const errorLabel = error
    ? error?.response?.status
      ? `HTTP ${error.response.status}`
      : String(error)
    : "";

  return (
    <div className={styles.page}>
      <h2>申請編集</h2>
      {isLoading && <p>Loading...</p>}
      {error && <p>エラー：{errorLabel}</p>}
      {!isLoading && !error && data && (
        <>
          {!canEdit && (
            <div className={styles.notEditable}>
              <p>
                この申請は下書き（DRAFT）または差戻し（RETURNED）のときだけ編集できます。
              </p>
              <p>現在の状態：{toStatusLabel(data.status)}</p>
            </div>
          )}
          {isReturned && data.lastReturnComment && (
            <div className={styles.returnComment}>
              <span className={styles.returnCommentLabel}>差戻しコメント</span>
              <span className={styles.returnCommentValue}>
                {data.lastReturnComment}
              </span>
            </div>
          )}
          {canEdit && (
            <div className={styles.card}>
              <label className={styles.field}>
                <span>件名</span>
                <input
                  value={isEditStarted ? title : (data.title ?? "")}
                  onFocus={() => ensureEditDraft()}
                  onChange={(e) => {
                    ensureEditDraft();
                    setTitle(e.target.value);
                  }}
                  disabled={isWorking}
                  placeholder="例）交通費精算"
                />
              </label>
              <label className={styles.field}>
                <span>金額</span>
                <input
                  value={isEditStarted ? amount : String(data.amount ?? 0)}
                  onFocus={() => ensureEditDraft()}
                  onChange={(e) => {
                    ensureEditDraft();
                    setAmount(e.target.value);
                  }}
                  disabled={isWorking}
                  inputMode="numeric"
                  placeholder="例）1200"
                />
              </label>
              <label className={styles.field}>
                <span>備考</span>
                <textarea
                  value={isEditStarted ? note : (data.note ?? "")}
                  onFocus={() => ensureEditDraft()}
                  onChange={(e) => {
                    ensureEditDraft();
                    setNote(e.target.value);
                  }}
                  disabled={isWorking}
                  rows={4}
                  placeholder="例）領収書あり"
                />
              </label>
            </div>
          )}
          <div className={styles.actions}>
            {canEdit && (
              <>
                <button
                  type="button"
                  className={styles.btnSave}
                  onClick={() => saveMutation.mutate()}
                  disabled={isWorking}
                >
                  {saveMutation.isPending ? "保存中..." : "保存"}
                </button>
                <button
                  type="button"
                  className={styles.btnResubmit}
                  onClick={() => resubmitMutation.mutate()}
                  disabled={isWorking}
                >
                  {resubmitMutation.isPending ? "再提出中..." : "再提出"}
                </button>
              </>
            )}
            <Link href={`/requests/${requestId}`} className={styles.btnBack}>
              詳細に戻る
            </Link>
          </div>
        </>
      )}
      {!isLoading && !error && !data && <p>データがありません</p>}
    </div>
  );
}

export default function RequestEditPage() {
  return (
    <RequireAuth>
      <RequestEditContent />
    </RequireAuth>
  );
}
