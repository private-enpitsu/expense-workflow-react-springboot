import { useAtomValue } from "jotai"; // Jotaiのatomを「読む」ためのHook（このページでは読むだけにする）
import { healthSnapshotAtom } from "../lib/atoms"; // Healthの表示状態を保持する共有atom（/ が更新した値を読む）
import styles from "./LoginPage.module.css"; // CSS Modulesを読み込む（仕様書：import styles from "./Xxx.module.css"）:contentReference[oaicite:5]{index=5}

export default function LoginPage() { // /login で表示するページ（表示だけ）
  const healthSnapshot = useAtomValue(healthSnapshotAtom);
  return ( // UIを返す
    <div div className={styles.page}> {/* ページコンテナ（CSS Modules） */}
      <h1 className={styles.title}>Login</h1> {/* 見出し */}
      <p className={styles.text}>ここにログインフォームを作っていきます（今は表示のみ）。</p> {/* 既存の説明文 */}
      <p className={styles.text}>Last Health: {healthSnapshot.status}</p> {/* 追加: Healthの状態を1行だけ表示する */}
    </div> // ページコンテナここまで
  ); // 返却ここまで
} // LoginPageここまで
