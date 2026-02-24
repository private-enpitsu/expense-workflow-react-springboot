/*
  src/pages/RequestDetailPage.jsx
  目的: /requests/:id の「申請詳細」ページで詳細表示を行い、RETURNED のときだけ編集して保存（PATCH）できるUIを提供する
  呼び出し元/使用箇所: src/App.jsx の <Route path="/requests/:id" element={<RequestDetailPage />} /> から表示される
  入力と出力: 入力=URLの :id（useParams） / 出力=詳細表示＋（RETURNED時のみ）差戻しコメント表示＋編集リンク
  今回変更点: RETURNED のときに data.lastReturnComment を表示するようにした
*/

import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";

import { apiClient } from "../lib/apiClient";
import { toStatusLabel, toRequestLabel } from "../lib/statusLabel";

export default function RequestDetailPage() {
  const params = useParams();
  const requestId = params.id;

  const fetchRequestDetail = async () => {
    const res = await apiClient.get(`/requests/${requestId}`);
    return res.data;
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["request", requestId],
    queryFn: fetchRequestDetail,
    enabled: typeof requestId === "string" && requestId.length > 0,
  });

  const errorLabel = error
    ? error.response?.status
      ? `HTTP ${error.response.status}`
      : String(error)
    : "";

  const canEditReturned = Boolean(data && data.status === "RETURNED");

  return (
    <div>
      <h2>申請詳細</h2>
      <p>申請ID：{toRequestLabel(requestId)}</p>

      {isLoading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>エラー：{errorLabel}</p>
      ) : data ? (
        <div>
          <p>件名：{data.title}</p>
          <p>金額：{data.amount}</p>
          <p>状態：{toStatusLabel(data.status)}</p>
          <p>備考：{data.note}</p>
          <p>履歴件数：{Array.isArray(data.actions) ? data.actions.length : 0}</p>

          {/* RETURNED のときだけ差戻しコメントを表示する */}
          {canEditReturned && data.lastReturnComment && (
            <p>差戻しコメント：{data.lastReturnComment}</p>
          )}

          {/* RETURNED のときだけ「修正する」リンクを表示する */}
          {canEditReturned && (
            <p>
              <Link to={`/requests/${requestId}/edit`}>修正する</Link>
            </p>
          )}
        </div>
      ) : (
        <p>データがありません</p>
      )}

      <p>
        <Link to="/requests">一覧に戻る</Link>
      </p>
    </div>
  );
}
