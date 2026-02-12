/*
  ファイル: src/pages/RequestsListPage.jsx // ファイルの場所を明示する
  目的: 申請（Requests）の一覧ページで、GET /api/requests を呼んで一覧を表示する（ダミー表示からAPI接続へ） // このファイルの役割を明確にする
  呼び出し元/使用箇所: src/App.jsx の <Route path="/requests" element={<RequestsListPage />} /> から表示される // どこから呼ばれるかを明確にする
  入力と出力: 入力（props）なし / 出力は「申請一覧（ID・金額・状態）」の表示（Loading/Errorも表示） // 受け取りと返す表示内容を固定する
  依存／前提: TanStack Query（useQuery）/ apiClient（Axios）/ React Router（Link）/ CSS Modules（RequestsListPage.module.css） // 依存関係を明示する
  今回変更点: ダミー配列の表示をやめて useQuery で GET /api/requests を取得し、結果を表示する（1ステップ＝1概念：API接続表示） // 今回のAxisで増えた点を1行で示す
*/

import { Link } from "react-router-dom"; // ルーティング遷移用の Link を使う（IDクリックで詳細へ移動するため）

import styles from "./RequestsListPage.module.css"; // CSS Modules を読み込み
import { apiClient } from "../lib/apiClient";
import { useQuery } from "@tanstack/react-query";

// const dummyRequests = [// APIが無い段階でもUIを確認できるように、固定のダミーデータを用意する
//   { id: "REQ-001", amount: 1200, status: "DRAFT" }, // 申請ID・金額（1以上）・状態（例）を1件分定義する
//   { id: "REQ-002", amount: 5000, status: "SUBMITTED" },
//   { id: "REQ-003", amount: 300, status: "APPROVED" }
// ]; // ダミーデータ定義ここまで

export default function RequestsListPage() {

  const fetchRequests = async () => {
    // APIから申請一覧を取得する非同期関数
    const res = await apiClient.get("/requests"); // GET /api/requests を呼び出す（baseURL=/api は apiClient 側で設定済み）
    return res.data; // 取得したデータを返す（Axiosのレスポンスは data プロパティに実データが入っている）
  };

  const { data, isLoading, error } = useQuery({ // useQuery を使ってデータ取得を行う
    queryKey: ["requests"], // クエリキーを設定（キャッシュ識別用）
    queryFn: fetchRequests, // データ取得関数を指定
    refetchOnWindowFocus: false, // ウィンドウフォーカス時の再取得を無効化（必要に応じて変更可）
  });

  const httpStatus = error?.response?.status ?? null; // エラーがあればHTTPステータスを取り出し、無ければnullにする
  const errorLabel = error ? (httpStatus ? `HTTP ${httpStatus}` : String(error)) : ""; // 表示用のエラーメッセージを1行にまとめる

  return (
    <div className={styles.page}> {/* ページ全体のコンテナ（CSS Modules）を適用する */}
      <h1 className={styles.title}>Requests</h1> {/* ページ見出し（申請一覧）を表示する */}
      {isLoading && <p className={styles.note}>Loading...</p>} {/* ローディング中は Loading... を表示して状態が分かるようにする */}
      {error && <p className={styles.note}>Error: {errorLabel}</p>} {/* エラー時は Error: ... を表示して切り分けできるようにする */}
      {!isLoading && !error && ( // 取得成功時だけ一覧を描画して、状態分岐を明確にする
        <ul className={styles.list}> {/* 申請一覧のリストを表示する */}
          {Array.isArray(data) && data.map((req) => ( /* 配列を map して、1件ずつ表示要素を作る */
            <li key={req.id} className={styles.listItem}> {/* key に申請IDを使い、1行分の見た目をCSSで整える */}
              <span className={styles.cell}> {/* 申請ID表示のセル領域を作る */}
                <Link to={`/requests/${req.id}`}>ID: {req.id}</Link> {/* クリックで /requests/:id に遷移する（:id に req.id を差し込む） */}
              </span> {/* 申請IDセル領域を閉じる */}
              <span className={styles.cell}>金額: {req.amount}</span> {/* 金額（数値）を表示する */}
              <span className={styles.cell}>状態: {req.status}</span> {/* 状態（文字列）を表示する */}
            </li> /* 1件分の行をここで終える */
          ))} {/* map の結果（複数行）をここに展開する */}
        </ul> /* 一覧リストをここで終える */
      )} {/* 成功時一覧ブロックをここで終える */}
    </div> /* ページコンテナをここで終える */
  );
}