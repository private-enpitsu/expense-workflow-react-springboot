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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"; // TanStack Query の useQuery を読み込む（Healthの取得はこれで実行する）
import { useSetAtom } from "jotai"; // Jotaiの「atom更新」だけ使う（atom定義はlib/atoms.jsへ移した）
import { healthSnapshotAtom, toastAtom } from "./lib/atoms"; // 共有atomを読み込む（/ が書いた状態を他画面で読めるようにする）
// import { BrowserRouter, Routes, Route, Link } from "react-router-dom"; // React Router（ルーティング）を読み込む
import { BrowserRouter, Routes, Route, Link, Navigate, Outlet, useLocation, useNavigate } from "react-router-dom"; // ルートガード（Navigate/Outlet/useLocation）を使うため追加で読み込む
import { apiClient } from "./lib/apiClient"; // Axios共通クライアントを読み込む（疎通確認に使う）

import LoginPage from "./pages/LoginPage"; // /login のページコンポーネントを読み込む
import RequestsListPage from "./pages/RequestsListPage" // /inbox のページコンポーネントを読み込む（承認待ち一覧：まずは表示だけ）
import InboxPage from "./pages/InboxPage"; // /inbox のページコンポーネントを読み込む（承認待ち一覧：表示だけ）
import RequestCreatePage from "./pages/RequestCreatePage"; // /requests/new のページコンポーネントを読み込む（申請作成：まずは表示だけ）
import RequestDetailPage from "./pages/RequestDetailPage"; // /requests/new のページコンポーネントを読み込む（申請作成：まずは表示だけ）
import ToastHost from "./components/ToastHost"; // アプリ共通Toastを表示するホストを読み込む（全ページで使い回す）

import styles from "./App.module.css"; // CSS Modules（インラインstyle禁止のため）を読み込む


// 既存の疎通確認ページ（/ の表示として残す）
function HealthCheckPage() {

  // useQuery の queryFn として疎通確認APIを叩く関数を定義する
  const fetchHealth = async () => {
    const res = await apiClient.get("/health"); // baseURL=/api と合成して GET /api/health を実行する（失敗時は例外が投げられる）
    return res.data; // 画面表示に必要なデータ（res.data）だけ返す
  }; // queryFn の定義ここまで

  const fetchMe = async () => {
    const res = await apiClient.get("/me"); // baseURL=/api と合成して GET /api/me を実行する（失敗時は例外が投げられる）
    return res.data; // 画面表示に必要なデータ（res.data）だけ返す
  }

  // Healthの取得状態（data/isLoading/error）を1つの概念として扱う
  const { data, isLoading, error } = useQuery({ // 分割代入で取得状態を取り出す
    queryKey: ["health"], // キャッシュキー（この画面の疎通確認を識別する）
    queryFn: fetchHealth, // 実際に通信する関数（上で定義した fetchHealth を使う）
    refetchOnWindowFocus: false, // 画面フォーカスで勝手に再取得しない（旧実装の「初回1回」に寄せる）
    retry: false // 失敗時に自動リトライしない（旧実装の挙動に寄せる）
  }); // useQuery の設定ここまで

  // const { data: meData, isLoading: isMeLoading, error: meError } = useQuery({
  const { isLoading: isMeLoading, error: meError } = useQuery({
    queryKey: ["me"],
    queryFn: fetchMe,
    refetchOnWindowFocus: false,
    retry: false
  });

  const meHttpStatus = meError?.response?.status ?? null;
  const meStatus = isMeLoading ? "Loading" : (meHttpStatus === 401 ? "未ログイン(401)" : (meError ? "エラー" : "ログイン中"));


  // 表示用ステータス（失敗なら失敗、成功ならstatus、未取得なら未確認）
  const status = error ? "失敗" : (data?.status ?? "未確認");
  const errorMessage = error  // エラー表示用の文字列を作る（旧実装の表示に寄せる）
  ? (error?.response ? `HTTP ${error.response.status}` : String(error)) // AxiosエラーならHTTPコード、そうでなければ文字列化する
  : ""; // エラーが無ければ空文字にする

  const setHealthSnapshot = useSetAtom(healthSnapshotAtom); // Healthの表示状態を共有atomへ書き込む
  const setToast = useSetAtom(toastAtom); // Toastの表示を共有atomへ書き込む（成功/失敗の通知に使う）

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

// 認証が必要なルートを保護するためのガードコンポーネントを定義する
function RequireAuth() {
  const location = useLocation(); // どのURLから来たか（戻り先）を保持できるように現在地を取得する
  const fetchMe = async () => {
    const res = await apiClient.get("/me"); // baseURL=/api と合成して GET /api/me を実行する（失敗時は例外が投げられる）
    return res.data; // 画面表示に必要なデータ（res.data）だけ返す
  };

  const { isLoading, error } = useQuery({
    queryKey: ["me"],
    queryFn: fetchMe,
    refetchOnWindowFocus: false,
    retry: false
  });

  const httpStatus = error?.response?.status ?? null; // AxiosエラーならHTTPステータスを取り出し、無ければnullにする
  if (isLoading) { // まだ判定中（/api/me 実行中）の場合
    return <div className={styles.page}>Checking session...</div>; // ローディング中は何も表示しない
  }

  if (httpStatus === 401) { // 未認証（401 Unauthorized）ならログインページへリダイレクトする
    return <Navigate to="/login" state={{ from: location }} replace />; // ログイン後に戻ってこれるように state に from を渡す
  }
  // <Navigate />はReact Routerのコンポーネントで、指定したパスへリダイレクトするために使う
  //replaceリダイレクト前の不正なURLを履歴を残さないようにする
  if (error) { // その他のエラーが発生した場合
    return <div className={styles.page}>Auth error</div>; // まずはエラー表示にして原因切り分けを容易にする
  }

  return <Outlet />; // 認証済みなら子コンポーネントを表示する（<Route>の子要素がここに入る）
} // RequireAuthここまで

// --BrowserRouter の内側で useNavigate を使うために、Router配下の描画を担当するコンポーネントを用意する
// useNavigate は “Router の中” でしか使えない
// 置換前の App() は <BrowserRouter> を “Appのreturnの中” で作っているので、App() 自体は Routerの外側にいる扱い
// だから App() の先頭で useNavigate() を呼ぶとエラーになる（＝使えない）
// そこで Routerの内側にいるコンポーネント（AppShell）を新設して、そこで useNavigate を使うようにした
function AppShell() {

  const navigate = useNavigate(); // ログアウト後に /login へ遷移するためのナビゲーション関数を取得する
  const queryClient = useQueryClient(); // ログアウト後に ["me"] を invalidate して再取得させるためのクライアントを取得する
  const setToast = useSetAtom(toastAtom); // ログアウト成功/失敗をToastで通知するために toastAtom へ書き込む関数を取得する
  const fetchMeForHeader = async () => { // ヘッダーに表示するための /api/me 取得処理を関数に分けます。
    const res = await apiClient.get("/me"); // baseURL=/api と合成して GET /api/me を実行する（失敗時は例外が投げられる）
    return res.data;; // 画面表示に必要なデータ（res.data）だけ返して、React Query の data として扱う
  };

  // /me を取得して「ヘッダーにログイン状態」を表示する
  const { data: meData, isLoading: isMeLoading, error: meError } = useQuery({
    queryKey: ["me"], // ログイン状態の正を ["me"] キャッシュに集約して invalidate で更新できるようにする
    queryFn: fetchMeForHeader, // /me を実際に取得する関数として fetchMeForHeader を渡す
    refetchOnWindowFocus: false, // フォーカスで勝手に再取得しない（挙動が追いやすいようにする）
    retry: false // 401等をそのまま観測したいので自動リトライを無効にする
  });

  const meHttpStatus = meError?.response?.status ?? null; // AxiosエラーならHTTPステータスを取り出し、無ければnullにする
  const isLoggedIn = !isMeLoading && meHttpStatus !== 401; // ローディングでも401でもエラーでもないときだけ「ログイン中」と見なす
  const meLabel = isMeLoading ? "Checking..." : (meHttpStatus === 401 ? "Guest" : (meError ? "Error" : (meData?.email ?? "Logged in"))); // 表示用のラベルを状態に応じて作る
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
    <div className={styles.app}> {/* 全ページ共通のレイアウトを適用する外枠コンテナとして表示する */}
      <ToastHost /> {/* どのページでもToastを出せるようにホストを配置して常時表示にする */}
      <nav className={styles.nav}> {/* Appのヘッダーとして常時表示するナビ領域を定義する */}
        <Link className={styles.navLink} to="/">Health</Link> {/* 疎通確認ページへ移動するリンクを表示する */}
        <Link className={styles.navLink} to="/requests">Requests</Link> {/* 申請一覧ページへ移動するリンクを表示する */}
        <Link className={styles.navLink} to="/requests/new">New Requests</Link> {/* 申請作成ページへ移動するリンクを表示する */}
        <Link className={styles.navLink} to="/requests/1">Request Detail</Link> {/* 申請詳細ページの確認用に固定IDへ移動するリンクを表示する */}
        <Link className={styles.navLink} to="/inbox">Inbox</Link> {/* 承認待ち一覧ページへ移動するリンクを表示する */}
        <Link className={styles.navLink} to="/login">Login</Link> {/* ログインページへ移動するリンクを表示する */}
        <span className={styles.navLink}>Me: {meLabel}</span> {/* /api/me の状態をヘッダーに常時表示して認証状態を見える化する */}
        <button type="button" className={styles.navLink} onClick={() => logoutMutation.mutate()} disabled={!isLoggedIn || logoutMutation.isPending}>Logout</button> {/* ログイン中だけ押せるLogoutボタンを表示し、押したらPOST /api/auth/logoutを実行する */}
      </nav> {/* ナビ領域の定義をここで閉じる */}
      <Routes> {/* URLと表示コンポーネントの対応を定義する */}
        <Route path="/" element={<HealthCheckPage />} /> {/* / は疎通確認ページとして既存機能を維持して表示する */}
        <Route path="/login" element={<LoginPage />} /> {/* /login はログインページとして表示する */}
        <Route element={<RequireAuth />}> {/* ここから先を認証が必要なルートとしてまとめる */}
          <Route path="/requests" element={<RequestsListPage />} /> {/* /requests は申請一覧ページとして表示する */}
          <Route path="/requests/new" element={<RequestCreatePage />} /> {/* /requests/new は申請作成ページとして表示する */}
          <Route path="/requests/:id" element={<RequestDetailPage />} /> {/* /requests/:id は申請詳細ページとして表示する */}
          <Route path="/inbox" element={<InboxPage />} /> {/* /inbox は承認待ち一覧ページとして表示する */}
        </Route> {/* 認証が必要なルート定義のまとまりをここで閉じる */}
      </Routes> {/* ルート定義をここで閉じる */}
    </div> // Router配下の外枠コンテナをここで閉じる
  );
} // AppShell ここまで

// BrowserRouter を提供して、Router配下で AppShell を描画する最上位コンポーネントを定義する
export default function App() { // BrowserRouter を提供して、Router配下で AppShell を描画する最上位コンポーネントを定義する
  return ( // Router コンテキストを供給するために BrowserRouter を返す
    <BrowserRouter> {/* ルーティング機能を有効化して、子コンポーネントで useNavigate 等を使えるようにする */}
      <AppShell /> {/* Router配下のUI（ヘッダー＋Routes）をまとめた AppShell を描画する */}
    </BrowserRouter>
  );
} // App の定義をここで終える
