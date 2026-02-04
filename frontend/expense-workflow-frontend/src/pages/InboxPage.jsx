/*
  src/pages/InboxPage.jsx // ファイルパスを明示する
  目的: /inbox にアクセスしたときに表示される「承認待ち一覧」ページの“表示だけ”の土台を用意する // まずは画面が出る状態を作る
  呼び出し元/使用箇所: src/App.jsx の <Route path="/inbox" element={<InboxPage />} /> から表示される // どこから使われるか
  依存: react（Reactコンポーネント） // 主要依存だけを書く
  今回の変更点: InboxPage（表示のみ）を新規追加した // 今回のAxisに一致
  入出力: Props なし / 画面表示のみ（API通信なし） // 未来依存を避ける
  注意点: 認証ガードや /api/inbox 接続はこの回では行わない（L0/L1のため） // 概念を増やさない
*/

export default function InboxPage() { // /inbox のページコンポーネントを定義する（表示だけ）
  return (
    <div>
      <h1>Inbox</h1>
      <p>承認待ち一覧（表示のみ）</p> {/* この回はAPI接続しないことを明示するテキスト */}
    </div> // コンテナの終わり
  );
}



