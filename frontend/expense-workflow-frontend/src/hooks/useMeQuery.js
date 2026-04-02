/*
GET /api/me を TanStack Query で取得し、ログイン判定（200=ログイン/401=未ログイン）のSOTを1箇所に集約する // 判定の重複を防ぐ
*/

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../lib/apiClient";

export function useMeQuery() {
  const fetchMe = async () => {
    const res = await apiClient.get("/me"); // GET /api/me を呼び出す
    return res.data; // 成功したらレスポンスの JSON 部分だけ返す
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["me"], // キャッシュキーは "me" で固定する（ユーザーデータは1人分しかないため）
    queryFn: fetchMe, // 先ほど定義した取得関数を使う
    retry: false, // 認証エラーなどで失敗しても自動リトライしない（401のときに何度も呼び出すのを避けるため）
    refetchOnWindowFocus: false, // 画面に戻ってきたときに再取得しない（認証状態が変わることはあまりないため）
  });

  const httpStatus = error?.response?.status ?? null; // エラーがAxiosエラーならHTTPステータスを取り出す。そうでなければ null を返す

  return { data, isLoading, error, httpStatus }; // 呼び出し側が認証状態を判定できるように、HTTPステータスも含めて返す
}
