/*
  src/pages/RequestDetailPage.jsx // ファイルパスを明示する
  目的: /requests/:id の「申請詳細」ページで詳細表示を行い、RETURNED のときだけ編集して保存（PATCH）できるUIを提供する // このAxisの目的を説明する
  呼び出し元/使用箇所: src/App.jsx の <Route path="/requests/:id" element={<RequestDetailPage />} /> から表示される // どこから使われるかを説明する
  入力と出力: 入力=URLの :id（useParams） / 出力=詳細表示＋（RETURNED時のみ）編集フォーム＋保存ボタン // 入出力を説明する
  依存／前提: react, react-router-dom, @tanstack/react-query, jotai, apiClient, statusLabel // 主要依存を列挙する
  今回の変更点: RETURNED のときだけ編集UIを表示し、PATCH /api/requests/{id} で「編集して保存」を成立させる // 変更点を説明する
*/

// import { useState } from "react"; // 取得後にフォームへ初期値を流し込むために useEffect/useState を使う
// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"; // 詳細取得と更新/提出のmutationにTanStack Queryを使う
import { useQuery } from "@tanstack/react-query"; // 詳細取得と更新/提出のmutationにTanStack Queryを使う
// import { useSetAtom } from "jotai"; // Toast を出すために jotai atom へ書き込む setter を取得する
import { useParams, Link } from "react-router-dom"; // URLパラメータ取得（useParams）と一覧へ戻るリンク（Link）を使う

// import { toastAtom } from "../lib/atoms"; // 成功/失敗の通知に使う toastAtom を読み込む
import { apiClient } from "../lib/apiClient"; // baseURL=/api の共通クライアントで API を呼ぶ
import { toStatusLabel } from "../lib/statusLabel"; // ステータス表示を日本語化する変換関数を読み込む

export default function RequestDetailPage() { // /requests/:id のページコンポーネントを定義する（このページは閲覧に寄せる）
  const params = useParams(); // URLパラメータ（/requests/:id）から値を取得して、どの申請の詳細かを特定する
  const requestId = params.id; // :id の値を requestId として扱い、APIのURL組み立てに使う

  const fetchRequestDetail = async () => { // GET /api/requests/{id} の取得処理を関数に切り出す
    const res = await apiClient.get(`/requests/${requestId}`); // baseURL=/api と合成して GET /api/requests/{id} を実行する
    return res.data; // 画面表示に使うレスポンスボディだけを返す
  }; // fetchRequestDetail の定義を終える

  const { data, isLoading, error } = useQuery({ // 申請詳細データを取得するための useQuery を使う
    queryKey: ["request", requestId], // キャッシュキーに requestId を含めて、IDごとにキャッシュを分ける
    queryFn: fetchRequestDetail, // 先ほど定義した取得関数を使う
    enabled: typeof requestId === "string" && requestId.length > 0, // requestId が空のときは取得しない（無駄なリクエストを防ぐ）
  }); // useQuery の呼び出しを終える

  const errorLabel = error ? (error.response?.status ? `HTTP ${error.response.status}` : String(error)) : ""; // エラーがあればHTTPステータス等を短く表示する

  const canEditReturned = Boolean(data && data.status === "RETURNED"); // RETURNED のときだけ「修正する（編集へ）」を出す判定を作る

  return ( // 画面の表示を返す
    <div> {/* 画面のルート要素を定義する */}
      <h1>申請詳細</h1> {/* 画面の見出しを表示する */}
      <p>申請ID：{requestId}</p> {/* いま見ている申請IDを表示して確認できるようにする */}

      {isLoading ? ( // ローディング中の分岐を開始する
        <p>Loading...</p> // ローディング中の表示を行う
      ) : error ? ( // エラー時の分岐を開始する
        <p>エラー：{errorLabel}</p> // エラー要約を表示して、Network/ログと紐付けられるようにする
      ) : data ? ( // 成功時（dataが取れた）の分岐を開始する
        <div> {/* 詳細表示ブロックを開始する */}
          <p>件名：{data.title}</p> {/* 詳細データの件名を表示する */}
          <p>金額：{data.amount}</p> {/* 詳細データの金額を表示する */}
          <p>状態：{toStatusLabel(data.status)}</p> {/* 詳細データの状態を日本語ラベルに変換して表示する */}
          <p>備考：{data.note}</p> {/* 詳細データの備考を表示する */}
          <p>履歴件数：{Array.isArray(data.actions) ? data.actions.length : 0}</p> {/* actions配列の件数を表示して「配列が返っている」ことを確認する */}

          {canEditReturned ? ( // RETURNED のときだけ「修正する」を表示する分岐を行う
            <p> {/* ボタン（リンク）を置く行を開始する */}
              <Link to={`/requests/${requestId}/edit`}>修正する</Link> {/* 編集ページへ遷移して、保存/再提出の操作は編集側へ寄せる */}
            </p> /* 行をここで閉じる */
          ) : null} {/* RETURNED以外は修正導線を出さない */}
        </div> /* 詳細表示ブロックをここで閉じる */
      ) : ( // enabled=false 等で data が無い場合の分岐を開始する
        <p>データがありません</p> // 取得できなかった場合の表示を行う
      )}

      <p> {/* 戻るリンクの行を開始する */}
        <Link to="/requests">一覧に戻る</Link> {/* クリックで申請一覧（/requests）へ戻る */}
      </p>
    </div>
  );
}