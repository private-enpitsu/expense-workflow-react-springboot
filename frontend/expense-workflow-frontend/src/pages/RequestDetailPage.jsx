/*
  src/pages/RequestDetailPage.jsx // ファイルパスを明示する
  目的: /requests/:id にアクセスしたときに表示される「申請詳細」ページで、URLパラメータの id を画面に表示できるようにする // 次のAPI接続の前にidの扱いを確立する
  呼び出し元/使用箇所: src/App.jsx の <Route path="/requests/:id" element={<RequestDetailPage />} /> から表示される // どこから使われるか
  入力と出力: 入力=URLの :id（useParamsで取得） / 出力=画面表示（idを含むJSX） // この回は表示にだけ使う
  依存／前提: react（Reactコンポーネント）, react-router-dom（useParams） // 主要依存のみを書く
  今回の変更点: useParams で :id を取得し、画面に表示するようにした // 今回のAxisに一致
  注意点: API接続（GET /api/requests/:id）や認証ガードはこの回では行わない（未来依存を避ける） // 概念を増やさない
*/

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSetAtom } from "jotai"; // Toast を出すために jotai atom へ書き込む setter を取得する
import { useParams, Link } from "react-router-dom"; // URLパラメータ取得（useParams）と一覧へ戻るリンク（Link）を使う
import { toastAtom } from "../lib/atoms"; // 成功/失敗の通知に使う toastAtom を読み込む
import { apiClient } from "../lib/apiClient"; // baseURL=/api の共通クライアントで submit API を呼ぶ

export default function RequestDetailPage() { // /requests/:id のページコンポーネントを定義する（表示だけ）
  const params = useParams(); // URLパラメータ（/requests/:id）から値を取得して、どの申請の詳細かを特定します。
  const requestId = params.id; // このアプリでは :id に "REQ-001" のような外部IDを渡す前提なので、そのまま requestId として使います。


  const queryClient = useQueryClient(); // TanStack Query の QueryClient を使うためのフックを呼び出す
  const setToast = useSetAtom(toastAtom); // Toast を出すための jotai atom へ書き込む setter を取得する

   // GET /api/requests/{id} の取得処理を関数に切り出す
  const fetchRequestDetail = async () => {
    const res = await apiClient.get(`/requests/${requestId}`); // baseURL=/api と合成して GET /api/requests/{id} を実行する
    return res.data; // 画面表示に使うレスポンスボディだけを返す
  };

  // 提出（submit）を実行する mutation を定義する
  const submitMutation = useMutation({
    mutationFn: async () => { // 提出APIを呼ぶ非同期関数を定義する
      const res = await apiClient.post(`/requests/${requestId}/submit`); // POST /api/requests/{id}/submit を呼び出して状態遷移させる
      return res.data;
    },

    // 提出成功後の処理を定義する
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["requests"] });  // 一覧（My Requests）を再取得させるために無効化する
      await queryClient.invalidateQueries({ queryKey: ["request", requestId] }); // 詳細（いま開いている申請）を再取得させるために無効化する
      await queryClient.invalidateQueries({ queryKey: ["inbox"] }); // Inbox（承認者側）に反映させるために無効化する
      setToast({ open: true, type: "success", message: "提出しました" }); // 成功したことをToastで通知する
    },

    // 提出失敗時の処理を定義する
    onError: (error) => {
      const status = error?.response?.status ?? null; // AxiosエラーならHTTPステータスを取り出す
      const msg = status ? `HTTP ${status}` : String(error); // 表示用メッセージを最小で組み立てる
      setToast({ open: true, type: "error", message: `提出に失敗しました: ${msg}` }); // 失敗理由をToastで通知する
    }

  });//submitMutation




  //requestId ごとに詳細を取得してキャッシュする
  const { data, isLoading, error } = useQuery({ // 申請詳細データを取得するための useQuery を使う
    queryKey: ["request", requestId], // キャッシュキーに requestId を含めて、IDごとにキャッシュを分ける
    queryFn: fetchRequestDetail, // 先ほど定義した取得関数を使う
    enabled: requestId.length > 0, // requestId が空のときは取得しない（無駄なリクエストを防ぐ）
  });

  const errorLabel = error ? (error.response?.status ? `HTTP ${error.response.status}` : String(error)) : ""; // エラーがあればHTTPステータス等を短く表示する

  return (
    <div>
      <h1>Request Detail</h1>
      <p>申請ID：{requestId}</p> {/* いま見ている申請IDを表示して確認できるようにする */}
      {isLoading ? ( // ローディング中の分岐を開始する
        <p>Loading...</p> // ローディング中の表示を行う（HTMLのみ）
      ) : error ? ( // エラー時の分岐を開始する
        <p>エラー：{errorLabel}</p> /* エラー要約を表示して、Network/ログと紐付けられるようにする */
      ) : data ? ( // 成功時（dataが取れた）の分岐を開始する
        <div>
          <p>件名：{data.title}</p> {/* 詳細データの件名を表示する */}
          <p>金額：{data.amount}</p> {/* 詳細データの金額を表示する */}
          <p>状態：{data.status}</p> {/* 詳細データの状態を表示する */}
          <p>備考：{data.note}</p> {/* 詳細データの備考を表示する */}
          <p>履歴件数：{Array.isArray(data.actions) ? data.actions.length : 0}</p> {/* actions配列の件数を表示して「配列が返っている」を確認する */}

          <button
            type="button" // form 送信ではなくクリック操作として扱う
            onClick={() => submitMutation.mutate()} // クリックで submit mutation を実行する
            disabled={submitMutation.isPending || data.status !== "DRAFT"} // 送信中やDRAFT以外は押せないようにする
          >
            {submitMutation.isPending ? "提出中..." : "提出"} {/* 送信中は表示を変えて二重送信を避ける */}
          </button>
        </div>
      ) : ( // enabled=false 等で data が無い場合の分岐を開始する
        <p>データがありません</p> // 取得できなかった場合の表示を行う（HTMLのみ）
      )}
      <p>
        <Link to="/requests">一覧に戻る</Link> {/* クリックで申請一覧（/requests）へ戻る */}
      </p>
    </div>
  );
} //RequestDetailPage

