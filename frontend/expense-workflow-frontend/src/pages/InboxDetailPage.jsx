/*
  src/pages/InboxDetailPage.jsx // ファイルパスを明示する
  目的: 承認者が /inbox/:id で申請の詳細を確認し、承認と差戻し（コメント必須）を実行できる画面を提供する // このファイルの目的を説明する
  呼び出し元/使用箇所: src/App.jsx の <Route path="/inbox/:id" element={<InboxDetailPage />} /> から表示される // どこから使われるかを説明する
  入力と出力: 入力=URLの :id（REQ-xxx）/ 出力=詳細表示＋承認ボタン＋差戻しコメント入力＋差戻し送信 // 入出力を説明する
  依存／前提: react, react-router-dom, @tanstack/react-query, jotai(toastAtom), apiClient, statusLabel が利用できる // 依存関係を説明する
  今回変更点: 受信箱一覧の操作を廃止し、詳細画面で承認/差戻し（コメント付きPOST）を実行できるように新規追加する // 今回変更点を説明する
*/

import { useState } from "react"; // 差戻しコメント入力をローカルstateで保持するために読み込む
import { Link, useNavigate, useParams } from "react-router-dom"; // URLパラメータ取得と画面遷移と戻りリンク表示のために読み込む
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"; // 詳細取得と承認/差戻しのPOSTを管理するために読み込む
import { useSetAtom } from "jotai"; // 成功/失敗をToastで通知するために読み込む

import { apiClient } from "../lib/apiClient"; // /api へ通信するAxiosクライアントを使うために読み込む
import { toastAtom } from "../lib/atoms"; // Toast表示状態を更新するためのatomを読み込む
import { toStatusLabel, toRequestLabel } from "../lib/statusLabel"; // ステータス・申請ID表示の変換関数を読み込む

export default function InboxDetailPage() {
  // /inbox/:id の承認者用詳細ページを定義する

  const params = useParams(); // URLの :id を取り出すためにパラメータを取得する
  const requestId = params.id; // /inbox/:id の :id を申請ID（REQ-xxx）として扱う
  const navigate = useNavigate(); // 承認/差戻し後に /inbox へ戻すために遷移関数を取得する
  const queryClient = useQueryClient(); // mutation後に inbox/detail のキャッシュを無効化するためのクライアントを取得する
  const setToast = useSetAtom(toastAtom); // 成功/失敗をToastで通知するために toastAtom を更新する関数を取得する

  const [returnComment, setReturnComment] = useState(""); // 差戻しコメント入力欄の内容を保持するstateを用意する

  const fetchDetail = async () => {
    // 承認者用の詳細表示に必要な情報を取得する関数を定義する
    const res = await apiClient.get(`/inbox/${requestId}`); // 承認者専用の詳細取得API（GET /api/inbox/{id}）を呼び出して詳細データを取得する
    return res.data; // 取得した詳細データを返してuseQuery側で使えるようにする
  }; // fetchDetail の定義を閉じる

  const { data, isLoading, error } = useQuery({
    // 詳細取得クエリを定義する
    queryKey: ["requestDetailForInbox", requestId], // 承認者詳細のキャッシュキーを申請ID単位にする
    queryFn: fetchDetail, // 実際の取得処理は fetchDetail に委譲する
    enabled: Boolean(requestId), // requestId が取れているときだけ取得して無駄な通信を防ぐ
  }); // useQuery の定義を閉じる

  const approveMutation = useMutation({
    // 承認操作（POST /approve）を実行するMutationを定義する
    mutationFn: async () => {
      // 承認時に呼ぶ関数を定義する
      await apiClient.post(`/requests/${requestId}/approve`); // POST /api/requests/{id}/approve を呼び出して承認遷移させる
    }, // mutationFn を閉じる
    onSuccess: async () => {
      // 承認成功時の後処理を定義する
      await queryClient.invalidateQueries({ queryKey: ["inbox"] }); // 受信箱一覧を再取得して最新化する
      await queryClient.invalidateQueries({
        queryKey: ["requestDetailForInbox", requestId],
      }); // この詳細も再取得して表示を最新化する
      setToast({ open: true, type: "success", message: "承認しました" }); // 成功をToastで通知する
      navigate("/inbox", { replace: true }); // 一覧へ戻して次の処理に進めるようにする
    }, // onSuccess を閉じる
    onError: (e) => {
      // 承認失敗時の処理を定義する
      setToast({
        open: true,
        type: "error",
        message: `承認に失敗: ${String(e)}`,
      }); // 失敗理由をToastへ出して切り分けしやすくする
    }, // onError を閉じる
  }); // approveMutation を閉じる

  const returnMutation = useMutation({
    // 差戻し操作（POST /return）を実行するMutationを定義する
    mutationFn: async () => {
      // 差戻し時に呼ぶ関数を定義する
      await apiClient.post(`/requests/${requestId}/return`, {
        comment: returnComment,
      }); // 差戻しコメントをbodyに付けて POST /api/requests/{id}/return を呼ぶ
    }, // mutationFn を閉じる
    onSuccess: async () => {
      // 差戻し成功時の後処理を定義する
      await queryClient.invalidateQueries({ queryKey: ["inbox"] }); // 受信箱一覧を再取得して最新化する
      await queryClient.invalidateQueries({
        queryKey: ["requestDetailForInbox", requestId],
      }); // この詳細も再取得して表示を最新化する
      setToast({ open: true, type: "success", message: "差戻しました" }); // 成功をToastで通知する
      navigate("/inbox", { replace: true }); // 一覧へ戻して次の処理に進めるようにする
    }, // onSuccess を閉じる
    onError: (e) => {
      // 差戻し失敗時の処理を定義する
      setToast({
        open: true,
        type: "error",
        message: `差戻しに失敗: ${String(e)}`,
      }); // 失敗理由をToastへ出して切り分けしやすくする
    }, // onError を閉じる
  }); // returnMutation を閉じる

  const canReturn = Boolean(
    returnComment && String(returnComment).trim().length > 0,
  ); // コメントが空でないときだけ差戻し送信を許可する判定を作る

  if (isLoading) return <p>Loading...</p>; // 詳細取得中はローディング表示にする
  if (error) return <p>エラー: {String(error)}</p>; // 取得失敗時はエラー表示にして状況を見える化する
  if (!data) return <p>Not found</p>; // データが無い場合は見つからない表示にして誤操作を防ぐ

  return (
    <div>
      <h1>受信箱：詳細</h1> {/* 承認者が詳細画面だと分かる見出しを表示する */}
      <p>申請ID：{toRequestLabel(requestId)}</p>{" "}
      {/* URL由来の申請IDを表示して対象を明確にする */}
      <p>ステータス：{toStatusLabel(data.status)}</p>{" "}
      {/* 取得したstatusを日本語ラベルに変換して表示する */}
      <p>タイトル：{data.title}</p> {/* 申請タイトルを表示して判断材料にする */}
      <p>金額：{data.amount}</p> {/* 金額を表示して判断材料にする */}
      <p>目的：{data.purpose ?? "-"}</p>{" "}
      {/* purpose が取得できる場合は表示し、無ければ - を表示する */}
      <p>メモ：{data.note ?? "-"}</p>{" "}
      {/* note が取得できる場合は表示し、無ければ - を表示する */}
      <h2>操作</h2> {/* 承認者の操作ブロックであることを示す見出しを表示する */}
      <button
        type="button" // フォーム送信ではなくクリック操作として扱う
        onClick={() => approveMutation.mutate()} // クリックで承認APIを実行する
        disabled={approveMutation.isPending} // 送信中は二重操作を防ぐため無効化する
      >
        承認
      </button>
      <div>
        <h3>差戻し</h3> {/* 差戻し操作であることを見出しで示す */}
        <textarea
          value={returnComment}
          onChange={(e) => setReturnComment(e.target.value)}
          placeholder="差戻しコメント（必須）"
          rows={4}
        />
        <button
          type="button"
          onClick={() => returnMutation.mutate()}
          disabled={!canReturn || returnMutation.isPending}
        >
          差戻す
        </button>
      </div>
      <p>
        <Link to="/inbox">一覧に戻る</Link>
      </p>
    </div>
  );
}
