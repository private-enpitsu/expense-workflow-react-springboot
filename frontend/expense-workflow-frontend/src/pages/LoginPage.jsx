import styles from "./LoginPage.module.css"; // CSS Modulesを読み込む（仕様書：import styles from "./Xxx.module.css"）:contentReference[oaicite:5]{index=5}

export default function LoginPage() { // /login で表示するページ（表示だけ）
  return ( // UIを返す
    <div className={styles.page}> {/* ページコンテナ（インラインstyle禁止なのでCSS Modulesを使う）:contentReference[oaicite:6]{index=6} */}
      <h1 className={styles.title}>Login</h1> {/* 見出し */}
      <p className={styles.text}>ここにログインフォームを作っていきます（今は表示のみ）。</p> {/* 説明文 */}
    </div> // ページコンテナここまで
  ); // 返却ここまで
}
