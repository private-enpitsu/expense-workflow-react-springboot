/*
  src/App.jsx // ファイルパスを明示する
  目的: ルーティングを提供し、/ はBackend Check（疎通UI）を維持しつつ、/login を表示するためのルートコンポーネントを定義する // “Health”命名を避けて疎通UIの役割で表現する
  呼び出し元/使用箇所: src/main.jsx から <App /> として読み込まれ、アプリ全体のルートとして描画される // どこから呼ばれるかを明確化する
  依存: react-router-dom（BrowserRouter/Routes/Route/Link）, @tanstack/react-query（useQuery）, jotai（atom/useSetAtom）, ./lib/apiClient（Axiosクライアント）, ./App.module.css（CSS Modules）, ./pages/LoginPage // 参照している主要依存を列挙する
  今回の変更点: /requests/:id ルート（表示だけ）を追加し、ナビゲーションに Request Detail（/requests/1）を追加した（/ のHealthは壊さない） // 今回のAxis（/requests/:id表示）に合わせて説明を更新する
  入出力: 画面表示のみ（Props なし）。/api/health のレスポンス（例: { status: "OK" }）を表示に反映する // URLは維持する前提を明示する
  注意点: これは命名の置換のみで、疎通確認の実行経路（/api/health 呼び出し）は変えない // L4（既存を壊さない）に寄せる
*/

import { useEffect } from "react"; // Jotai atomへ「表示状態」を同期するためにuseEffectを使う
import { useQuery } from "@tanstack/react-query"; // TanStack Query の useQuery を読み込む（Healthの取得はこれで実行する）
import { useSetAtom } from "jotai"; // Jotaiの「atom更新」だけ使う（atom定義はlib/atoms.jsへ移した）
import { healthSnapshotAtom } from "./lib/atoms"; // 共有atomを読み込む（/ が書いた状態を他画面で読めるようにする）
import { BrowserRouter, Routes, Route, Link } from "react-router-dom"; // React Router（ルーティング）を読み込む
import { apiClient } from "./lib/apiClient"; // Axios共通クライアントを読み込む（疎通確認に使う）

import LoginPage from "./pages/LoginPage"; // /login のページコンポーネントを読み込む
import RequestsListPage from "./pages/RequestsListPage" // /inbox のページコンポーネントを読み込む（承認待ち一覧：まずは表示だけ）
import InboxPage from "./pages/InboxPage"; // /inbox のページコンポーネントを読み込む（承認待ち一覧：表示だけ）
import RequestCreatePage from "./pages/RequestCreatePage"; // /requests/new のページコンポーネントを読み込む（申請作成：まずは表示だけ）
import RequestDetailPage from "./pages/RequestDetailPage"; // /requests/new のページコンポーネントを読み込む（申請作成：まずは表示だけ）


import styles from "./App.module.css"; // CSS Modules（インラインstyle禁止のため）を読み込む

function HealthCheckPage() { // 既存の疎通確認ページ（/ の表示として残す）
  const fetchHealth = async () => { // useQuery の queryFn として疎通確認APIを叩く関数を定義する
    const res = await apiClient.get("/health"); // baseURL=/api と合成して GET /api/health を実行する（失敗時は例外が投げられる）
    return res.data; // 画面表示に必要なデータ（res.data）だけ返す
  }; // queryFn の定義ここまで

  const { data, isLoading, error } = useQuery({ // Healthの取得状態（data/isLoading/error）を1つの概念として扱う
    queryKey: ["health"], // キャッシュキー（この画面の疎通確認を識別する）
    queryFn: fetchHealth, // 実際に通信する関数（上で定義した fetchHealth を使う）
    refetchOnWindowFocus: false, // 画面フォーカスで勝手に再取得しない（旧実装の「初回1回」に寄せる）
    retry: false // 失敗時に自動リトライしない（旧実装の挙動に寄せる）
  }); // useQuery の設定ここまで

  const status = error ? "失敗" : (data?.status ?? "未確認"); // 表示用ステータス（失敗なら失敗、成功ならstatus、未取得なら未確認）
  const errorMessage = error  // エラー表示用の文字列を作る（旧実装の表示に寄せる）
  ? (error?.response ? `HTTP ${error.response.status}` : String(error)) // AxiosエラーならHTTPコード、そうでなければ文字列化する
  : ""; // エラーが無ければ空文字にする

  const setHealthSnapshot = useSetAtom(healthSnapshotAtom);
  useEffect(() => {
    setHealthSnapshot({ status, isLoading, errorMessage });
  }, [setHealthSnapshot, status, isLoading, errorMessage]);



  // const [status, setStatus] = useState("未確認"); // 疎通結果の状態を持つ
  // const [error, setError] = useState(""); // エラー文の状態を持つ
  // const [isLoading, setIsLoading] = useState(false); // ローディング状態を持つ

  // useEffect(() => { // 初回表示で1回だけ疎通確認を実行する
  //   const fetchHealth = async () => { // 疎通確認APIを叩く関数を用意する
  //     setIsLoading(true); // 通信開始なのでローディングをONにする
  //     setError(""); // 前回エラー表示を消す
  //     try {
  //       const res = await apiClient.get("/api/health"); // GET /api/health を実行する
  //       setStatus(res.data?.status ?? "不明"); // statusがあれば表示し、なければ不明にする
  //     } catch (e) {
  //       const message = e?.response ? `HTTP ${e.response.status}` : String(e); // 失敗時に表示用メッセージを作る
  //       setError(message); // エラー状態に入れる
  //       setStatus("失敗"); // ステータスも失敗にする
  //     } finally {
  //       setIsLoading(false); // 通信終了なのでローディングをOFFにする
  //     }
  //   };

  //   fetchHealth(); // 実際にhealth APIを呼び出して結果を画面に反映する

  // },[]); // 依存配列を空にして、初回マウント時に1回だけ実行する

  return (
    <div className={styles.page}> {/* ページコンテナ（CSS Modules） */}
      <h1 className={styles.title}>Health Check</h1>
      <p className={styles.text}>Loading:{String(isLoading)}</p> {/* ローディング状態 */}
      <p className={styles.text}>Status: {status}</p> {/* ステータス表示 */}
      {errorMessage && <p className={styles.error}>Error: {errorMessage}</p>} {/* エラーがあれば表示する */}
      <p className={styles.text}>Backend URL: /api/health</p> {/* 叩いているURLを明示する */}
    </div>
  );
} // HealthCheckPage ここまで

export default function App() { // ルートコンポーネント（ルーティングのみ）
  return ( // アプリ全体のUIを返す
    <BrowserRouter> {/* URLに応じて画面を切り替える */}
      <div className={styles.app}> {/* 全体コンテナ */}
        <nav className={styles.nav}> {/* ナビゲーション */}
          <Link className={styles.navLink} to="/">Health</Link> {/* / に移動するリンク */}
          <Link className={styles.navLink} to="/requests">Requests</Link> {/* /requests に移動するリンク（申請一覧：表示だけ） */}
          <Link className={styles.navLink} to="/requests/new">New Requests</Link> {/* /requests/new に移動するリンク（申請作成：まずは表示だけ） */}
          <Link className={styles.navLink} to="/requests/1">Request Detail</Link> {/* /requests/:id の確認用リンク（例として /requests/1 に移動する） */}
          <Link className={styles.navLink} to="/inbox">Inbox</Link> {/* /login に移動するリンク */}
          <Link className={styles.navLink} to="/login">Login</Link> {/* /login に移動するリンク */}
        </nav>

        <Routes> {/* URLと表示コンポーネントを対応付ける */}
          <Route path="/" element={<HealthCheckPage />} /> {/* / は疎通確認ページ */}
          <Route path="/requests" element={<RequestsListPage />} />  {/* /requests は申請一覧ページ（表示だけ） */}
          <Route path="/requests/new" element={<RequestCreatePage />} />  {/* /requests/new は申請作成ページ（表示だけ） */}
          <Route path="/requests/:id" element={<RequestDetailPage />} /> {/* /requests/:id は申請詳細ページ（まずは表示だけ） */}
          <Route path="/inbox" element={<InboxPage />} /> {/* /inbox は承認待ち一覧ページ（まずは表示だけ） */}
          <Route path="/login" element={<LoginPage />} /> {/* /login はログインページ */}
        </Routes>
      </div>
    </BrowserRouter>
  );
}
