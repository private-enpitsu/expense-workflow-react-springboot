/*
  src/pages/RequestDetailPage.jsx // ファイルパスを明示する
  目的: /requests/:id にアクセスしたときに表示される「申請詳細」ページの“表示だけ”の土台を用意する // まずは画面が出る状態を作る
  呼び出し元/使用箇所: src/App.jsx の <Route path="/requests/:id" element={<RequestDetailPage />} /> から表示される // どこから使われるか
  入力と出力: 入力=URLの :id（この回は表示に使わない） / 出力=画面表示（JSX） // 今回はuseParams等は使わず概念を増やさない
  依存／前提: react（Reactコンポーネント） // 主要依存のみを書く
  今回の変更点: RequestDetailPage（表示のみ）を新規追加した // 今回のAxisに一致
  注意点: API接続（GET /api/requests/:id）や認証ガードはこの回では行わない（未来依存を避ける） // 追加概念を増やさない
*/

export default function RequestDetailPage() { // /requests/:id のページコンポーネントを定義する（表示だけ）
  return (
    <div>
      <h1>Request Detail</h1>
      <p>申請詳細ページ（表示のみ）</p> {/* この回はAPI接続しないことを明示するテキスト */}
    </div> // コンテナの終わり
  );
}

