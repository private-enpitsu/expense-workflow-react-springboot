/*
GET /api/me を TanStack Query で取得し、ログイン判定（200=ログイン/401=未ログイン）のSOTを1箇所に集約する // 判定の重複を防ぐ
*/

import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { apiClient } from "../lib/apiClient";

// バックエンドの MeResponse DTO に対応する型
export type MeResponse = {
  userId: number;
  username: string;
  email: string;
  role: "USER" | "APPLICANT" | "APPROVER" | "ADMIN";
};

export function useMeQuery() {
  const fetchMe = async () => {
    const res = await apiClient.get("/me"); // GET /api/me を呼び出す
    return res.data; // 成功したらレスポンスの JSON 部分だけ返す
  };

  const { data, isLoading, error } = useQuery<MeResponse, AxiosError>({
    queryKey: ["me"],
    queryFn: fetchMe,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const httpStatus = error?.response?.status ?? null;

  return { data, isLoading, error, httpStatus };
}
