/*
  認証が必要なルートを保護するコンポーネント
  未ログイン（401）の場合は /login にリダイレクトする
*/

import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useMeQuery } from "../hooks/useMeQuery";

import styles from "../App.module.css";

// 認証が必要なルートを保護するガードコンポーネントを定義する
export default function RequireAuth() {
  // ログイン後に元のページへ戻すため現在のURLを保持
  const location = useLocation();

  // /api/me により認証状態を取得
  const { isLoading, error, httpStatus } = useMeQuery();

  // 判定中表示
  if (isLoading) {
    return <div className={styles.page}>Checking session...</div>;
  }

  // 未ログイン時はログイン画面へリダイレクト
  if (httpStatus === 401) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (error) {
    return (
      <div className={styles.page}>An error occurred: {String(error)}</div>
    );
  }

  return <Outlet />;
}
