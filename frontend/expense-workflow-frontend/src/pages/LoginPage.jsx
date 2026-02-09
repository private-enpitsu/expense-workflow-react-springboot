// [目的] /login で「ログイン後に戻る先(from)」を受け取り可視化し、後続のログイン成功時リダイレクト接続の土台を作る // ファイルの役割
// [呼び出し元/使用箇所] App.jsx の <Route path="/login" element={<LoginPage />} /> から表示され、RequireAuth が渡す state.from を読む // どこから使われるか
// [入力と出力] 入力=react-router-dom の location.state（from）/ 出力=画面表示（ログイン後に戻る先を表示） // 入出力
// [依存/前提] jotai（healthSnapshotAtom）/ react-router-dom（useLocation）/ CSS Modules（LoginPage.module.css）/ ログイン処理は未実装のため「成功時に戻る」は実行経路に入れない // 依存と前提

import { useAtomValue } from "jotai"; // Jotaiのatomを「読む」ためのHook（このページでは読むだけにする）
import { useLocation } from "react-router-dom"; // React Router の useLocation を読み込む（location.state.from を読むために使う）
import { healthSnapshotAtom } from "../lib/atoms"; // Healthの表示状態を保持する共有atom（/ が更新した値を読む）
import styles from "./LoginPage.module.css"; // CSS Modulesを読み込む（仕様書：import styles from "./Xxx.module.css"）:contentReference[oaicite:5]{index=5}

export default function LoginPage() { // /login で表示するページ（表示だけ）

  const healthSnapshot = useAtomValue(healthSnapshotAtom);
  const location = useLocation(); // ログインページに渡された state.from を取得する
  const fromPathname = location.state?.from?.pathname || "/"; // state.from.pathname があれば使い、なければ "/" にフォールバックする

  return ( // UIを返す
    <div className={styles.page}> {/* ページコンテナ（CSS Modules） */}
      <h1 className={styles.title}>Login</h1> {/* 見出し */}
      <p className={styles.text}>ここにログインフォームを作っていきます（今は表示のみ）。</p> {/* 既存の説明文 */}
      <p className={styles.text}>ログイン後に戻る先: { fromPathname }</p> {/* 追加: ログイン後に戻る先を表示する */}
      <p className={styles.text}>Last Health: {healthSnapshot.status}</p> {/* 追加: Healthの状態を1行だけ表示する */}
    </div> // ページコンテナここまで
  );
} // LoginPageここまで
