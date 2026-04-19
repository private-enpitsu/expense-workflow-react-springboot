"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSetAtom } from "jotai";
import { AxiosError } from "axios";
import { apiClient } from "../lib/apiClient";
import { healthSnapshotAtom, toastAtom } from "../lib/atoms";
import { useMeQuery } from "../hooks/useMeQuery";

type HealthResponse = {
  status: string;
};

export default function HealthCheckPage() {
  const fetchHealth = async (): Promise<HealthResponse> => {
    const res = await apiClient.get<HealthResponse>("/health");
    return res.data;
  };

  const { data, isLoading, error } = useQuery<HealthResponse, AxiosError>({
    queryKey: ["health"],
    queryFn: fetchHealth,
    refetchOnWindowFocus: false,
    retry: false,
  });

  const {
    isLoading: isMeLoading,
    error: meError,
    httpStatus: meHttpStatus,
  } = useMeQuery();

  const meStatus = isMeLoading
    ? "Loading"
    : meHttpStatus === 401
      ? "未ログイン(401)"
      : meError
        ? "エラー"
        : "ログイン中";

  const status = error ? "失敗" : (data?.status ?? "未確認");
  const errorMessage = error
    ? error?.response
      ? `HTTP ${error.response.status}`
      : String(error)
    : "";

  const setHealthSnapshot = useSetAtom(healthSnapshotAtom);
  const setToast = useSetAtom(toastAtom);

  useEffect(() => {
    setHealthSnapshot({ status, isLoading, errorMessage });
  }, [setHealthSnapshot, status, isLoading, errorMessage]);

  useEffect(() => {
    if (isLoading) return;
    if (errorMessage) {
      setToast({
        open: true,
        type: "error",
        message: `Health 失敗: ${errorMessage}`,
      });
      return;
    }
    if (data?.status) {
      setToast({
        open: true,
        type: "success",
        message: `Health 成功: ${data.status}`,
      });
    }
  }, [isLoading, errorMessage, data?.status, setToast]);

  return (
    <div>
      <h1>Health Check</h1>
      <p>Loading: {String(isLoading)}</p>
      <p>Status: {status}</p>
      <p>Me: {meStatus}</p>
      {errorMessage && <p>Error: {errorMessage}</p>}
      <p>Backend URL: /api/health</p>
    </div>
  );
}
