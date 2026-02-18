/*
  src/components/RequireAuth.jsx // ファイルパスを明示する
  目的: 認証が必要なルートを保護し、未ログイン（401）の場合に /login へ誘導する // ルートガードの共通部品
  呼び出し元/使用箇所: src/App.jsx の <Route element={<RequireAuth />}> 配下で使われる // Routesのelementとして使う
  入出力: 入力なし、出力は <Outlet />（認証OK）または <Navigate />（401時）を返す // ルーティングの表示を切り替える
  依存: react-router-dom（Navigate/Outlet/useLocation）, ../hooks/useMeQuery（/api/me判定）, ../App.module.css（表示スタイル） // 依存を列挙する
  今回変更点: App.jsx 内のガード関数を切り出し、/api/me 判定は useMeQuery に統一する // 共通化の一部として新設する
*/

import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useMeQuery } from "../hooks/useMeQuery";

import styles from "../App.module.css"; // Checking/Auth error 表示に既存CSS Modulesを使う



// 認証が必要なルートを保護するガードコンポーネントを定義する
export default function RequireAuth() {
  const location = useLocation(); // ログイン後に元のURLへ戻すための現在地情報を取得する
  const { isLoading, error, httpStatus } = useMeQuery(); // /api/me の結果から 401 かどうかを判定できる情報を受け取る


  if (isLoading) {
    return <div className={styles.page}>Checking session...</div>;  // 判定中であることが分かる最小表示を返す
  }

  if (httpStatus === 401) { // HTTPステータスが401なら未ログインと判断する
    return <Navigate to="/login" state={{ from: location }} replace />; // /login へ遷移させる。stateで元の場所を渡して、ログイン後に戻れるようにする
  }

  if (error) { // 401以外のエラーがあった場合は、念のため保護しているルートには入れないようにする
    return <div className={styles.page}>An error occurred: {String(error)}</div>; // エラー内容を表示する
  }

  return <Outlet />; // 認証OKなら子ルートを表示するための Outlet を返す



} //RequireAuth