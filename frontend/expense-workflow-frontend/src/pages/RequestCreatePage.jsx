/*
import RequestsListPage from './RequestsListPage';
  src/pages/RequestCreatePage.jsx // ファイルパスを明示する
  目的: /requests/new にアクセスしたときに表示される「申請作成」ページの“表示だけ”の土台を用意する // まずは画面が出る状態を作る
  呼び出し元/使用箇所: src/App.jsx の <Route path="/requests/new" element={<RequestCreatePage />} /> から表示される // どこから使われるか
  依存: react（Reactコンポーネント） // 主要依存だけを書く
  今回の変更点: RequestCreatePage（表示のみ）を新規追加した // 今回のAxisに一致
  入出力: Props なし / 画面表示のみ（API通信なし） // 未来依存を避ける
  注意点: 認証ガードや POST /api/requests 接続はこの回では行わない（L0/L1のため） // 概念を増やさない
*/

export default function RequestsListPage() { // /requests/new のページコンポーネントを定義する（表示だけ）
  return (
    <div>
      <h1>New Request</h1>
      <p>申請作成ページ（表示のみ）</p> {/* この回はAPI接続しないことを明示するテキスト */}
    </div> // コンテナの終わり
  );
}


