/* このファイルは、承認者向けの Inbox 画面を表示するために存在します。 */
/* この画面は App.jsx の /inbox ルートから呼び出されます。 */
/* 入力はありません。出力は /api/inbox から取得した一覧データの表示です。 */
/* 依存は TanStack Query、共通 apiClient、React です。 */
/* 今回は GET /api/inbox を呼び、一覧を表示できるようにします。 */

// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import { useSetAtom } from "jotai";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../lib/apiClient";
// import { toastAtom } from "../lib/atoms";
import { toStatusLabel, toRequestLabel } from "../lib/statusLabel"; // ステータス・申請ID表示の変換関数を読み込む

export default function InboxPage() {
  // /inbox のページコンポーネントを定義し、一覧から詳細へ遷移する入口を提供する

  const fetchInbox = async () => {
    // Inbox一覧を取得する関数を定義する
    const res = await apiClient.get("/inbox"); // baseURL=/api と合成して GET /api/inbox を呼び出す
    return res.data; // 受信箱の一覧データを返す
  }; // fetchInbox の定義を閉じる

  const { data, isLoading, error } = useQuery({
    // /api/inbox を取得するクエリを定義する
    queryKey: ["inbox"], // Inbox一覧のキャッシュキーを ["inbox"] に固定する
    queryFn: fetchInbox, // 実際の取得処理は fetchInbox に委譲する
  }); // useQuery の定義を閉じる

  if (isLoading) return <p>Loading...</p>; // 読み込み中はローディング表示にする
  if (error) return <p>エラー: {String(error)}</p>; // 失敗時はエラー表示にする

  return (
    <div>
      <h1>受信箱</h1> {/* 画面の見出しとして Inbox を表示する */}
      <table>
        <thead>
          <tr>
            <th>申請ID</th> {/* requestId を表示する列 */}
            <th>タイトル</th> {/* title を表示する列 */}
            <th>金額</th> {/* amount を表示する列 */}
            <th>ステータス</th> {/* status を表示する列 */}
            <th>操作</th> {/* 詳細へ進むリンクを置く列 */}
          </tr>
        </thead>
        <tbody>
          {data.map(
            (
              item, // 取得した一覧データを1行ずつ処理する
            ) => (
              <tr key={item.id}>
                {" "}
                {/* requestId を行の一意キーとして使う */}
                <td>
                  {" "}
                  {/* 申請IDセルを定義する */}
                  <Link to={`/inbox/${item.id}`}>
                    {toRequestLabel(item.id)}
                  </Link>{" "}
                  {/* 申請IDから承認者用詳細へ遷移できるようにリンクにする */}
                </td>{" "}
                {/* 申請IDセルを閉じる */}
                <td>{item.title}</td> {/* タイトルを表示する */}
                <td>{item.amount}</td> {/* 金額を表示する */}
                <td>{toStatusLabel(item.status)}</td>{" "}
                {/* ステータス（内部コード）を日本語ラベルに変換して表示する */}
                <td>
                  {" "}
                  {/* 操作セルを定義する */}
                  <Link to={`/inbox/${item.id}`}>詳細</Link>{" "}
                  {/* 一覧は入口に徹し、操作は詳細で行うため詳細リンクだけを表示する */}
                </td>
              </tr>
            ),
          )}
        </tbody>
      </table>
    </div>
  );
}
