import { useEffect, useState } from "react"; // Reactフック（副作用・状態）を読み込む
import { BrowserRouter, Routes, Route, Link } from "react-router-dom"; // React Router（ルーティング）を読み込む
import { apiClient } from "./lib/apiClient"; // Axios共通クライアントを読み込む（疎通確認に使う）
import LoginPage from "./pages/LoginPage"; // /login のページコンポーネントを読み込む
import styles from "./App.module.css"; // CSS Modules（インラインstyle禁止のため）を読み込む



function HealthCheckPage() { // 既存の疎通確認ページ（/ の表示として残す）
  const [status, setStatus] = useState("未確認"); // 疎通結果の状態を持つ
  const [error, setError] = useState(""); // エラー文の状態を持つ
  const [isLoading, setIsLoading] = useState(false); // ローディング状態を持つ

  useEffect(() => { // 初回表示で1回だけ疎通確認を実行する
    const fetchHealth = async () => { // 疎通確認APIを叩く関数を用意する
      setIsLoading(true); // 通信開始なのでローディングをONにする
      setError(""); // 前回エラー表示を消す
      try {
        const res = await apiClient.get("/api/health"); // GET /api/health を実行する
        setStatus(res.data?.status ?? "不明"); // statusがあれば表示し、なければ不明にする
      } catch (e) {
        const message = e?.response ? `HTTP ${e.response.status}` : String(e); // 失敗時に表示用メッセージを作る
        setError(message); // エラー状態に入れる
        setStatus("失敗"); // ステータスも失敗にする
      } finally {
        setIsLoading(false); // 通信終了なのでローディングをOFFにする
      }
    };

    fetchHealth(); // 実際にhealth APIを呼び出して結果を画面に反映する

  },[]); // 依存配列を空にして、初回マウント時に1回だけ実行する

  return (
    <div className={styles.page}> {/* ページコンテナ（CSS Modules） */}
      <h1 className={styles.title}>Health Check</h1>
      <p className={styles.text}>Loading:{String(isLoading)}</p> {/* ローディング状態 */}
      <p className={styles.text}>Status: {status}</p> {/* ステータス表示 */}
      {error && <p className={styles.error}>Error: {error}</p>} {/* エラーがあれば表示する */}
      <p className={styles.text}>Backend URL: /api/health</p> {/* 叩いているURLを明示する */}
    </div>
  );
}

export default function App() { // ルートコンポーネント（ルーティングのみ）
  return ( // アプリ全体のUIを返す
    <BrowserRouter> {/* URLに応じて画面を切り替える */}
      <div className={styles.app}> {/* 全体コンテナ */}
        <nav className={styles.nav}> {/* ナビゲーション */}
          <Link className={styles.navLink} to="/">Health</Link> {/* / に移動するリンク */}
          <Link className={styles.navLink} to="/login">Login</Link> {/* /login に移動するリンク */}
        </nav>

        <Routes> {/* URLと表示コンポーネントを対応付ける */}
          <Route path="/" element={<HealthCheckPage />} /> {/* / は疎通確認ページ */}
          <Route path="/login" element={<LoginPage />} /> {/* /login はログインページ */}
        </Routes>
      </div>
    </BrowserRouter>
  );
}
