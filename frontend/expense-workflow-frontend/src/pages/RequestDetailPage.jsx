/*
  src/pages/RequestDetailPage.jsx // ファイルパスを明示する
  目的: /requests/:id にアクセスしたときに表示される「申請詳細」ページで、URLパラメータの id を画面に表示できるようにする // 次のAPI接続の前にidの扱いを確立する
  呼び出し元/使用箇所: src/App.jsx の <Route path="/requests/:id" element={<RequestDetailPage />} /> から表示される // どこから使われるか
  入力と出力: 入力=URLの :id（useParamsで取得） / 出力=画面表示（idを含むJSX） // この回は表示にだけ使う
  依存／前提: react（Reactコンポーネント）, react-router-dom（useParams） // 主要依存のみを書く
  今回の変更点: useParams で :id を取得し、画面に表示するようにした // 今回のAxisに一致
  注意点: API接続（GET /api/requests/:id）や認証ガードはこの回では行わない（未来依存を避ける） // 概念を増やさない
*/

import { useParams } from "react-router-dom";

export default function RequestDetailPage() { // /requests/:id のページコンポーネントを定義する（表示だけ）
  const params = useParams(); // URLパラメータを取得する
  const requestId = params.id; // :id パラメータを取り出す
  return (
    <div>
      <h1>Request Detail</h1>
      <p>申請ID：{requestId}</p> {/* URLの :id が取れていることを画面に表示して確認する */}
      <p>申請詳細ページ（表示のみ）</p> {/* この回はAPI接続しないことを明示するテキスト */}
    </div> // コンテナの終わり
  );
}

