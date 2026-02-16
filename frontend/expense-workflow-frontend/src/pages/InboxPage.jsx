/* このファイルは、承認者向けの Inbox 画面を表示するために存在します。 */
/* この画面は App.jsx の /inbox ルートから呼び出されます。 */
/* 入力はありません。出力は /api/inbox から取得した一覧データの表示です。 */
/* 依存は TanStack Query、共通 apiClient、React です。 */
/* 今回は GET /api/inbox を呼び、一覧を表示できるようにします。 */

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../lib/apiClient";


export default function InboxPage() { // /inbox のページコンポーネントを定義する（表示だけ）

  const fetchInbox = async () => { // Inbox 一覧を取得するための関数を定義する
    const res = await apiClient.get("/inbox"); // GET /api/inbox を実行して一覧データを取得する
    return res.data; // レスポンスの JSON 配列部分だけを返す
  };

  const { data, isLoading, error } = useQuery( // TanStack Query を使って Inbox 一覧を取得する
    {
      queryKey: ["inbox"], // クエリのキーを "inbox" に設定する
      queryFn: fetchInbox, // クエリ関数として fetchInbox を指定する
    }
  );

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Inbox の取得に失敗しました</p>;
  }

  return (
    <div>
      <h1>Inbox</h1> {/* 画面の見出しとして Inbox を表示する */}
      <table>
        <thead>
          <tr>
            <th>申請ID</th> {/* requestId を表示する列 */}
            <th>タイトル</th> {/* title を表示する列 */}
            <th>金額</th> {/* amount を表示する列 */}
            <th>ステータス</th> {/* status を表示する列 */}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => ( // 取得した一覧データを1行ずつ処理する
            <tr key={item.requestId}> {/* requestId を行の一意キーとして使う */}
              <td>{item.requestId}</td> {/* 申請IDを表示する */}
              <td>{item.title}</td> {/* タイトルを表示する */}
              <td>{item.amount}</td> {/* 金額を表示する */}
              <td>{item.status}</td> {/* ステータスを表示する */}
            </tr>
          ))} {/* 一覧表示のループを終える */}
        </tbody>
      </table>
    </div>
  );
}



