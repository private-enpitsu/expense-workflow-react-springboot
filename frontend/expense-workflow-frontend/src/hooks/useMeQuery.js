/*
  src/hooks/useMeQuery.js // ファイルパスを明示する
  目的: GET /api/me を TanStack Query で取得し、ログイン判定（200=ログイン/401=未ログイン）のSOTを1箇所に集約する // 判定の重複を防ぐ
  呼び出し元/使用箇所: src/App.jsx（HealthCheckPage と AppShell）と src/components/RequireAuth.jsx（ルートガード）から呼ばれる // 利用箇所を明示する
  入出力: 入力なし、出力は { data, isLoading, error, httpStatus } を返す // 呼び出し側が判定に使える形で返す
  依存: @tanstack/react-query（useQuery）, ../lib/apiClient（Axiosクライアント） // 依存を列挙する
  今回変更点: /api/me の queryKey/retry/refetchOnWindowFocus をこのhookへ集約する // 共通化の中心を作る
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



} // useMeQuery