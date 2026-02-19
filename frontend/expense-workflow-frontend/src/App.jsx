/*
  src/App.jsx // ファイルパスを明示する
  目的: ルーティングを提供し、/ はBackend Check（疎通UI）を維持しつつ、/login を表示するためのルートコンポーネントを定義する // “Health”命名を避けて疎通UIの役割で表現する
  呼び出し元/使用箇所: src/main.jsx から <App /> として読み込まれ、アプリ全体のルートとして描画される // どこから呼ばれるかを明確化する
  依存: react-router-dom（BrowserRouter/Routes/Route/Link）, @tanstack/react-query（useQuery）, jotai（atom/useSetAtom）, ./lib/apiClient（Axiosクライアント）, ./App.module.css（CSS Modules）, ./pages/LoginPage // 参照している主要依存を列挙する
  今回の変更点: /requests/:id ルート（表示だけ）を追加し、ナビゲーションに Request Detail（/requests/1）を追加した（/ のHealthは壊さない） // 今回のAxis（/requests/:id表示）に合わせて説明を更新する
  入出力: 画面表示のみ（Props なし）。/api/health のレスポンス（例: { status: "OK" }）を表示に反映する // URLは維持する前提を明示する
  注意点: これは命名の置換のみで、疎通確認の実行経路（/api/health 呼び出し）は変えない // L4（既存を壊さない）に寄せる
*/

import { useEffect } from "react"; // Health表示状態をatomへ同期するためにuseEffectを使う
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"; // Health取得（useQuery）とログアウト（useMutation）とinvalidate（useQueryClient）に使う
import { useSetAtom } from "jotai"; // Toast/Health状態を書き込むために setter を使う
import { healthSnapshotAtom, toastAtom } from "./lib/atoms"; // 共有atom（health表示状態/Toast）を読み込む
import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom"; // ルーティングとログアウト後遷移のために Router API を使う
import { apiClient } from "./lib/apiClient"; // Axios共通クライアントで /api/health を呼ぶために使う

import { useMeQuery } from "./hooks/useMeQuery"; // /api/me の判定ロジックを共通化したhookを読み込む
import RequireAuth from "./components/RequireAuth"; // 認証ガード（401→/login誘導）を共通部品として読み込む

import LoginPage from "./pages/LoginPage"; // /login のページコンポーネントを読み込む
import RequestsListPage from "./pages/RequestsListPage"; // /requests のページコンポーネントを読み込む
import InboxPage from "./pages/InboxPage"; // /inbox のページコンポーネントを読み込む
import RequestCreatePage from "./pages/RequestCreatePage"; // /requests/new のページコンポーネントを読み込む
import RequestDetailPage from "./pages/RequestDetailPage"; // /requests/:id のページコンポーネントを読み込む
import ToastHost from "./components/ToastHost"; // アプリ共通Toastを表示するホストを読み込む

import styles from "./App.module.css"; // CSS Modules を読み込む

// 既存の疎通確認ページ（/ の表示として残す）
function HealthCheckPage() {

  // useQuery の queryFn として疎通確認APIを叩く関数を定義する
  const fetchHealth = async () => {
    const res = await apiClient.get("/health"); // baseURL=/api と合成して GET /api/health を実行する（失敗時は例外が投げられる）
    return res.data; // 画面表示に必要なデータ（res.data）だけ返す
  };

  // Healthの取得状態（data/isLoading/error）を1つの概念として扱う
  const { data, isLoading, error } = useQuery({ // 分割代入で取得状態を取り出す
    queryKey: ["health"], // キャッシュキー（この画面の疎通確認を識別する）
    queryFn: fetchHealth, // 実際に通信する関数（上で定義した fetchHealth を使う）
    refetchOnWindowFocus: false, // 画面フォーカスで勝手に再取得しない（旧実装の「初回1回」に寄せる）
    retry: false // 失敗時に自動リトライしない（旧実装の挙動に寄せる）
  }); // useQuery の設定ここまで

  const { isLoading: isMeLoading, error: meError, httpStatus: meHttpStatus } = useMeQuery(); // /api/me の判定を共通hookへ委譲する
  const meStatus = isMeLoading ? "Loading" : (meHttpStatus === 401 ? "未ログイン(401)" : (meError ? "エラー" : "ログイン中")); // 200/401/その他で表示を切り替える

  const status = error ? "失敗" : (data?.status ?? "未確認"); // 表示用ステータス（失敗なら失敗、成功ならstatus、未取得なら未確認）
  const errorMessage = error  // エラー表示用の文字列を作る（旧実装の表示に寄せる）
    ? (error?.response ? `HTTP ${error.response.status}` : String(error)) // AxiosエラーならHTTPコード、そうでなければ文字列化する
    : ""; // エラーが無ければ空文字にする

  const setHealthSnapshot = useSetAtom(healthSnapshotAtom); // Healthの表示状態を共有atomへ書き込む setter を取得する
  const setToast = useSetAtom(toastAtom); // Toastの表示を共有atomへ書き込む setter を取得する（成功/失敗の通知に使う）

  useEffect(() => { // Healthの表示状態を共有atomへ同期する
    setHealthSnapshot({ status, isLoading, errorMessage }); // 現在の表示状態（status/loading/error）を保存する
  }, [setHealthSnapshot, status, isLoading, errorMessage]); // 表示状態が変わったら同期する

  useEffect(() => { // 疎通結果に応じてToastを表示する
    if (isLoading) return; // ローディング中はToastを出さない

    if (errorMessage) { // エラー発生時はエラートーストを出す
      setToast({
        open: true,
        type: "error",
        message: `Health 失敗: ${errorMessage}` // 失敗Toastを表示する
      });
      return; // 失敗時はここで終了する（成功Toastは出さない）
    }
    if (data?.status) { // 成功（statusが取れた）場合
      setToast({
        open: true,
        type: "success",
        message: `Health 成功: ${data.status}` // 成功Toastを表示する
      });
    }
  }, [isLoading, errorMessage, data?.status, setToast]); // 成功/失敗が確定したタイミングで実行する

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
      <p className={styles.text}>Me: {meStatus}</p> {/* /me の状態表示 ・/api/me の判定結果（未ログイン/ログイン中/エラー）を表示する*/}
      {errorMessage && <p className={styles.error}>Error: {errorMessage}</p>} {/* エラーがあれば表示する */}
      <p className={styles.text}>Backend URL: /api/health</p> {/* 叩いているURLを明示する */}
    </div>
  );
} // HealthCheckPage ここまで

function AppShell() {

  const navigate = useNavigate(); // ログアウト後に /login へ遷移するためのナビゲーション関数を取得する
  const queryClient = useQueryClient(); // ログアウト後に ["me"] を invalidate して再取得させるためのクライアントを取得する
  const setToast = useSetAtom(toastAtom); // ログアウト成功/失敗をToastで通知するために toastAtom へ書き込む関数を取得する


  const { data: meData, isLoading: isMeLoading, error: meError, httpStatus: meHttpStatus } = useMeQuery(); // ヘッダー表示の /api/me 判定を共通hookへ委譲する
  const isLoggedIn = !isMeLoading && meHttpStatus !== 401 && !meError; // ローディング中でも401でもエラーでもないときだけログイン中と扱う
  const meLabel = isMeLoading ? "Checking..." : (meHttpStatus === 401 ? "Guest" : (meError ? "Error" : (meData?.email ?? "Logged in"))); // 表示ラベルを状態から作る

  const logoutMutation = useMutation({ // ログアウト（POST /api/auth/logout）を Mutation として定義する
    mutationFn: async () => { // ログアウト時に呼び出すAPI処理を定義する
      await apiClient.post("/auth/logout"); // baseURL=/api と合成して POST /api/auth/logout を実行し、セッションから userId を削除させる
    }, // API呼び出しの定義をここで終える

    // ログアウトが成功したときの後処理を定義する
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["me"] }); // /me のキャッシュを無効化して、以後の判定が未ログイン(401)になるように更新する
      setToast({ // ログアウトが成功したことをユーザーに通知する
        open: true,
        type: "success",
        message: "Logged out successfully"
      });
      navigate("/login", { replace: true }); // ログアウト後にログインページへリダイレクトし、履歴を残さない
    }, // logout 成功時処理の定義をここで終える

    // ログアウトが失敗したときの後処理を定義する
    onError: (error) => {
      const msg = error?.response ? `HTTP ${error.response.status}` : String(error); // AxiosエラーならHTTPコードを、そうでなければ文字列化して表示用メッセージを作る
      setToast({ // 失敗理由をToastで通知して切り分けしやすくする
        open: true,
        type: "error",
        message: `Logout 失敗: ${msg}`
      });
    } // 失敗時処理の定義をここで終える
  });
  return (
    <div className={styles.app}> {/* 全ページ共通の外枠を表示する */}
      <ToastHost /> {/* どのページでもToastを出せるようにする */}
      <nav className={styles.nav}> {/* ヘッダーのナビ領域を表示する */}
        <Link className={styles.navLink} to="/">疎通確認</Link> {/* Health/ へのリンクを表示する */}
        <Link className={styles.navLink} to="/requests">申請一覧</Link> {/* /requests へのリンクを表示する */}
        <Link className={styles.navLink} to="/requests/new">申請作成</Link> {/* /requests/new へのリンクを表示する */}
        {/* <Link className={styles.navLink} to="/requests/1">Request Detail</Link> /requests/1 へのリンクを表示する */}
        <Link className={styles.navLink} to="/inbox">受信箱</Link> {/* /inbox へのリンクを表示する */}
        <Link className={styles.navLink} to="/login">ログイン</Link> {/* /login へのリンクを表示する */}
        <span className={styles.navLink}>Me: {meLabel}</span> {/* /api/me の状態を表示する */}
        <button type="button" className={styles.navLink} onClick={() => logoutMutation.mutate()} disabled={!isLoggedIn || logoutMutation.isPending}>ログアウト</button> {/* ログアウトボタンを表示する */}
      </nav> {/* ナビ領域を閉じる */}

      <Routes> {/* ルート定義を開始する */}
        <Route path="/" element={<HealthCheckPage />} /> {/* / は疎通確認ページを表示する */}
        <Route path="/login" element={<LoginPage />} /> {/* /login はログインページを表示する */}
        <Route element={<RequireAuth />}> {/* 認証が必要なルートをまとめる */}
          <Route path="/requests" element={<RequestsListPage />} /> {/* /requests を表示する */}
          <Route path="/requests/new" element={<RequestCreatePage />} /> {/* /requests/new を表示する */}
          <Route path="/requests/:id" element={<RequestDetailPage />} /> {/* /requests/:id を表示する */}
          <Route path="/inbox" element={<InboxPage />} /> {/* /inbox を表示する */}
        </Route> {/* 認証ルートのまとまりを閉じる */}
      </Routes> {/* ルート定義を閉じる */}
    </div> // 外枠を閉じる
  );
} // AppShell ここまで

// BrowserRouter を提供して、Router配下で AppShell を描画する最上位コンポーネントを定義する
export default function App() { // BrowserRouter を提供して、Router配下で AppShell を描画する最上位コンポーネントを定義する
  return ( // Router コンテキストを供給するために BrowserRouter を返す
    <BrowserRouter> {/* ルーティング機能を有効化して、子コンポーネントで useNavigate 等を使えるようにする */}
      <AppShell /> {/* Router配下のUI（ヘッダー＋Routes）をまとめた AppShell を描画する */}
    </BrowserRouter>
  );
}
