/*
  ファイル: src/pages/RequestsListPage.jsx // ファイルの場所を明示する
  目的: 申請（Requests）の一覧ページで、まずは「ダミーデータ3件」を表示してUIの土台を作る（API接続はまだ行わない） // このファイルの役割を明確にする
  呼び出し元/使用箇所: src/App.jsx の <Route path="/requests" element={<RequestsListPage />} /> から表示される // どこから呼ばれるかを明確にする
  入力と出力: 入力（props）なし / 出力は「ダミー申請3件の一覧表示（番号・金額・状態）」 // 受け取りと返す表示内容を固定する
  依存／前提: React（JSX） / CSS Modules（RequestsListPage.module.css） // 依存関係を明示する
  今回の変更点: 「申請一覧（準備中）」の固定文言をやめ、ダミーデータ3件を map で表示するように変更した（1ステップ＝1概念：一覧描画だけ） // 今回のAxisで増えた点を1行で示す
*/

import styles from "./RequestsListPage.module.css"; // CSS Modules を読み込み

const dummyRequests = [// APIが無い段階でもUIを確認できるように、固定のダミーデータを用意する
  { id: "REQ-001", amount: 1200, status: "DRAFT" }, // 申請ID・金額（1以上）・状態（例）を1件分定義する
  { id: "REQ-002", amount: 5000, status: "SUBMITTED" },
  { id: "REQ-003", amount: 300, status: "APPROVED" }
]; // ダミーデータ定義ここまで

export default function RequestsListPage() {
  return (
    <div className={styles.page}> {/* ページ全体のコンテナ（CSS Modules） */}
      <h1 className={styles.title}>Requests</h1> {/* ページ見出し（申請一覧） */}
      <ul className={styles.list}> {/* 申請一覧のリスト（API接続前なのでダミー表示） */}
        {dummyRequests.map((req) => ( /* 配列を map して、1件ずつ表示要素を作る */
          <li key={req.id} className={styles.listItem}> {/* key に申請IDを使い、1行分の見た目をCSSで整える */}
            <span className={styles.cell}>ID: {req.id}</span> {/* 申請IDを表示する */}
            <span className={styles.cell}>金額: {req.amount}</span> {/* 金額（数値）を表示する */}
            <span className={styles.cell}>状態: {req.status}</span> {/* 状態（文字列）を表示する */}
          </li> /* 1件分の行ここまで */
        ))} {/* map の結果（複数行）をここに展開する */}
      </ul> {/* 一覧リストここまで */}
    </div> // ページコンテナここまで
  );
}