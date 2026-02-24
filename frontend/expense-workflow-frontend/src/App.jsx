/*
  src/App.jsx // ファイルパスを明示する
  目的: ルーティングを提供し、/ はBackend Check（疎通UI）を維持しつつ、/login を表示するためのルートコンポーネントを定義する // “Health”命名を避けて疎通UIの役割で表現する
  呼び出し元/使用箇所: src/main.jsx から <App /> として読み込まれ、アプリ全体のルートとして描画される // どこから呼ばれるかを明確化する
  依存: react-router-dom（BrowserRouter/Routes/Route/Link）, @tanstack/react-query（useQuery）, jotai（atom/useSetAtom）, ./lib/apiClient（Axiosクライアント）, ./App.module.css（CSS Modules）, ./pages/LoginPage // 参照している主要依存を列挙する
  今回の変更点: /requests/:id ルート（表示だけ）を追加し、ナビゲーションに Request Detail（/requests/1）を追加した（/ のHealthは壊さない） // 今回のAxis（/requests/:id表示）に合わせて説明を更新する
  入出力: 画面表示のみ（Props なし）。/api/health のレスポンス（例: { status: "OK" }）を表示に反映する // URLは維持する前提を明示する
  注意点: これは命名の置換のみで、疎通確認の実行経路（/api/health 呼び出し）は変えない // L4（既存を壊さない）に寄せる
*/

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSetAtom } from "jotai";
import { healthSnapshotAtom, toastAtom } from "./lib/atoms";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { apiClient } from "./lib/apiClient";

import { useMeQuery } from "./hooks/useMeQuery";
import RequireAuth from "./components/RequireAuth";

import LoginPage from "./pages/LoginPage";
import RequestsListPage from "./pages/RequestsListPage";
import InboxPage from "./pages/InboxPage";
import InboxDetailPage from "./pages/InboxDetailPage";
import RequestCreatePage from "./pages/RequestCreatePage";
import RequestDetailPage from "./pages/RequestDetailPage";
import RequestEditPage from "./pages/RequestEditPage";
import ToastHost from "./components/ToastHost";

import styles from "./App.module.css";

import './index.css'; // リセットCSSをインポートする

/* ============================================================
   疎通確認ページ（/ のまま維持）
============================================================ */
function HealthCheckPage() {
  const fetchHealth = async () => {
    const res = await apiClient.get("/health");
    return res.data;
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["health"],
    queryFn: fetchHealth,
    refetchOnWindowFocus: false,
    retry: false,
  });

  const {
    isLoading: isMeLoading,
    error: meError,
    httpStatus: meHttpStatus,
  } = useMeQuery();

  const meStatus = isMeLoading
    ? "Loading"
    : meHttpStatus === 401
      ? "未ログイン(401)"
      : meError
        ? "エラー"
        : "ログイン中";

  const status = error ? "失敗" : (data?.status ?? "未確認");
  const errorMessage = error
    ? error?.response
      ? `HTTP ${error.response.status}`
      : String(error)
    : "";

  const setHealthSnapshot = useSetAtom(healthSnapshotAtom);
  const setToast = useSetAtom(toastAtom);

  useEffect(() => {
    setHealthSnapshot({ status, isLoading, errorMessage });
  }, [setHealthSnapshot, status, isLoading, errorMessage]);

  useEffect(() => {
    if (isLoading) return;
    if (errorMessage) {
      setToast({ open: true, type: "error", message: `Health 失敗: ${errorMessage}` });
      return;
    }
    if (data?.status) {
      setToast({ open: true, type: "success", message: `Health 成功: ${data.status}` });
    }
  }, [isLoading, errorMessage, data?.status, setToast]);

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Health Check</h1>
      <p className={styles.text}>Loading: {String(isLoading)}</p>
      <p className={styles.text}>Status: {status}</p>
      <p className={styles.text}>Me: {meStatus}</p>
      {errorMessage && <p className={styles.error}>Error: {errorMessage}</p>}
      <p className={styles.text}>Backend URL: /api/health</p>
    </div>
  );
}

/* ============================================================
   NavItem：アクティブ判定付きリンク
============================================================ */
function NavItem({ to, label }) {
  const location = useLocation();
const isActive =
  to === "/"
    ? location.pathname === "/"
    : to === "/requests"
      ? location.pathname === "/requests" ||
        (location.pathname.startsWith("/requests") &&
         !location.pathname.startsWith("/requests/new"))  // /new は除外
      : location.pathname.startsWith(to);

  return (
    <Link
      to={to}
      className={`${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}
    >
      {label}
    </Link>
  );
}

/* ============================================================
   AppShell：上部ナビ＋中央コンテンツカード
============================================================ */
function AppShell() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setToast = useSetAtom(toastAtom);

  const {
    data: meData,
    isLoading: isMeLoading,
    error: meError,
    httpStatus: meHttpStatus,
  } = useMeQuery();

  const isLoggedIn = !isMeLoading && meHttpStatus !== 401 && !meError;
  const role = isLoggedIn ? (meData?.role ?? "") : "";
  const isApplicant = Boolean(isLoggedIn && role === "APPLICANT");
  const isApprover  = Boolean(isLoggedIn && (role === "APPROVER" || role === "ADMIN"));

  const meLabel = isMeLoading
    ? "確認中..."
    : meHttpStatus === 401
      ? "Guest"
      : meError
        ? "Error"
        : (meData?.email ?? "Logged in");
  const meDisplay = isLoggedIn ? meLabel : "Guest";

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post("/auth/logout");
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["me"] });
      setToast({ open: true, type: "success", message: "ログアウトしました" });
      navigate("/login", { replace: true });
    },
    onError: (error) => {
      const msg = error?.response ? `HTTP ${error.response.status}` : String(error);
      setToast({ open: true, type: "error", message: `ログアウト失敗: ${msg}` });
    },
  });

  return (
    <>
      <h1 className={styles.site_title}>Expense Workflow App</h1>
      <div className={styles.app}>
        <ToastHost />

        {/* ===== 上部ナビバー（中央寄せ・区切り線なし） ===== */}
        <nav className={styles.nav}>
          <NavItem to="/" label="疎通確認" />

          {isApplicant && (
            <>
              <NavItem to="/requests"     label="申請一覧" />
              <NavItem to="/requests/new" label="申請作成" />
            </>
          )}

          {isApprover && (
            <NavItem to="/inbox" label="受信箱" />
          )}

          <span className={styles.navUser}>{meDisplay}</span>

          <button
            className={styles.navLink}
            onClick={() => {
              if (isLoggedIn) {
                logoutMutation.mutate();
              } else {
                navigate("/login");
              }
            }}
            disabled={isMeLoading || logoutMutation.isPending}
          >
            {isLoggedIn ? "ログアウト" : "ログイン"}
          </button>
        </nav>

        {/* ===== メインコンテンツ（ニューモーフィズムカードで中央表示） ===== */}
        <main className={styles.main}>
          <div className={styles.contentCard}>
            <Routes>
              <Route path="/" element={<HealthCheckPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route element={<RequireAuth />}>
                <Route path="/requests"          element={<RequestsListPage />} />
                <Route path="/requests/new"      element={<RequestCreatePage />} />
                <Route path="/requests/:id"      element={<RequestDetailPage />} />
                <Route path="/requests/:id/edit" element={<RequestEditPage />} />
                <Route path="/inbox"             element={<InboxPage />} />
                <Route path="/inbox/:id"         element={<InboxDetailPage />} />
              </Route>
            </Routes>
          </div>
        </main>
      </div>
    </>
  );
}

/* ============================================================
   App（エントリ）
============================================================ */
export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}
