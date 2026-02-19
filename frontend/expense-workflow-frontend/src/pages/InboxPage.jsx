/* このファイルは、承認者向けの Inbox 画面を表示するために存在します。 */
/* この画面は App.jsx の /inbox ルートから呼び出されます。 */
/* 入力はありません。出力は /api/inbox から取得した一覧データの表示です。 */
/* 依存は TanStack Query、共通 apiClient、React です。 */
/* 今回は GET /api/inbox を呼び、一覧を表示できるようにします。 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSetAtom } from "jotai";

import { apiClient } from "../lib/apiClient";
import { toastAtom } from "../lib/atoms";
import { toStatusLabel } from "../lib/statusLabel"; // ステータス表示を日本語化する変換関数を読み込む


export default function InboxPage() { // /inbox のページコンポーネントを定義する（表示だけ）

  const queryClient = useQueryClient(); // 承認成功後にクエリを invalidate するためのクライアントを取得する
  const setToast = useSetAtom(toastAtom); // Toast を出すための jotai atom へ書き込む setter を取得する

  const fetchInbox = async () => { // Inbox 一覧を取得するための関数を定義する
    const res = await apiClient.get("/inbox"); // GET /api/inbox を実行して一覧データを取得する
    return res.data; // レスポンスの JSON 配列部分だけを返す
  };

   // 承認を実行するための mutation を定義する // Inbox の各行から approve を実行するために mutation を用意する
  const approveMutation = useMutation({
    mutationFn: async (requestId) => { // 承認APIを呼ぶ非同期関数を定義する
      const res = await apiClient.post(`/requests/${requestId}/approve`); // POST /api/requests/{id}/approve を呼び出して状態遷移させる
      return res.data;
    },

    // 承認成功後の処理を定義する
    onSuccess: async (_data, requestId) => {
      await queryClient.invalidateQueries({ queryKey: ["inbox"] }); // Inbox を再取得させ、承認済みの行を反映させる
      await queryClient.invalidateQueries({ queryKey: ["requests"] }); // 申請一覧（My Requests）を再取得させ、状態反映させる
      await queryClient.invalidateQueries({ queryKey: ["request", requestId] }); // 詳細（当該申請）を再取得させ、状態反映させる
      setToast({ open: true, type: "success", message: `申請 ${requestId} を承認しました` }); // 成功したことをToastで通知する
    },

    onError: (error) => {
      const status = error?.response?.status ?? null; // AxiosエラーならHTTPステータスを取り出す
      const msg = status ? `HTTP ${status}` : String(error); // 表示用メッセージを最小で組み立てる
      setToast({ open: true, type: "error", message: `承認に失敗しました: ${msg}` }); // 失敗理由をToastで通知する
    },
    });//approveMutation

 // 差戻しを実行するための mutation を定義する // Inbox の各行から return を実行するために mutation を追加する
    const returnMutation = useMutation({
      mutationFn: async (requestId) => { // 差戻しAPIを呼ぶ非同期関数を定義する
        const res = await apiClient.post(`/requests/${requestId}/return`); // POST /api/requests/{id}/return を呼び出して状態遷移させる
        return res.data;
      },

      onSuccess: async (_data, requestId) => {
        await queryClient.invalidateQueries({ queryKey: ["inbox"] }); // Inbox を再取得して差戻し済みの行が反映されるようにする
        await queryClient.invalidateQueries({ queryKey: ["requests"] }); // 申請一覧（My Requests）を再取得させ、状態反映させる
        await queryClient.invalidateQueries({ queryKey: ["request", requestId] }); // 詳細（当該申請）を再取得させ、状態反映させ
        setToast({ open: true, type: "success", message: `申請 ${requestId} を差戻しました` }); // 成功したことをToastで通知する
      },

      onError: (error) => {
        const status = error?.response?.status ?? null; // AxiosエラーならHTTPステータスを取り出す
        const msg = status ? `HTTP ${status}` : String(error); // 表示用メッセージを最小で組み立てる
        setToast({ open: true, type: "error", message: `差戻しに失敗しました: ${msg}` }); // 失敗理由をToastで通知する
      },

    });//returnMutation





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
    return <p>受信箱 の取得に失敗しました</p>;
  }

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
            <th>操作</th> {/* 承認ボタンを置く列 */}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => ( // 取得した一覧データを1行ずつ処理する
            <tr key={item.requestId}> {/* requestId を行の一意キーとして使う */}
              <td>{item.requestId}</td> {/* 申請IDを表示する */}
              <td>{item.title}</td> {/* タイトルを表示する */}
              <td>{item.amount}</td> {/* 金額を表示する */}
              <td>{toStatusLabel(item.status)}</td> {/* ステータス（内部コード）を日本語ラベルに変換して表示する */}
              <td> {/* 操作ボタンをまとめて表示するセルを定義する */}

                {/* // 承認ボタンを表示する */}
                <button
                  type="button" // form送信ではなくクリック操作として扱う
                  onClick={() => approveMutation.mutate(item.requestId)} // クリックで当該行の requestId を渡して approve を実行する
                  disabled={approveMutation.isPending || item.status !== "SUBMITTED"} // mutation が実行中（通信中）やSUBMITTED以外は押せないようにして誤操作を防ぐ
                >
                  {approveMutation.isPending ? "承認中..." : "承認"} {/* isPending（送信中）なら "承認中..." 表示を変えて二重送信を避ける */}
                </button>

                {/* 差戻しボタンを表示する */}
                <button
                  type="button"
                  onClick={() => returnMutation.mutate(item.requestId)} // クリックで当該行の requestId を渡して return を実行する
                  disabled={returnMutation.isPending || item.status !== "SUBMITTED"} // mutation が実行中（通信中）やSUBMITTED以外は押せないようにして誤操作を防ぐ
                >
                  {returnMutation.isPending ? "差戻し中..." : "差戻し"} {/* isPending（送信中）なら "差戻し中..." 送信中は表示を変えて二重送信を避ける */}
                </button>
              </td>
            </tr>
          ))} {/* 一覧表示のループを終える */}
        </tbody>
      </table>
    </div>
  );
}



