// [目的] /login で「ログインフォーム送信 → セッション確立 → ログイン後に元の画面へ戻る」を実装する（初学者が認証フローを追えるようにする） // このファイルの役割
// [呼び出し元/使用箇所] App.jsx の <Route path="/login" element={<LoginPage />} /> から表示され、RequireAuth が渡す state.from を読んで戻り先を決める // どこから使われるか
// [入力と出力] 入力=フォーム入力（email/password）＋ location.state.from / 出力=ログイン成功時に navigate(from)・失敗時にToast表示 // 入出力の要点
// [依存/前提] apiClient（/api 経由のAxios）・TanStack Query（useQueryClientで["me"]をinvalidate）・Jotai（toastAtomで通知）・認証はセッションCookie（HttpOnly）で運用する // 依存と前提

import { useAtomValue, useSetAtom } from "jotai"; // Jotaiのatomを「読む」ためのHook（このページでは読むだけにする）
import { useLocation, useNavigate } from "react-router-dom"; // React Router の useLocation を読み込む（location.state.from を読むために使う）
import { healthSnapshotAtom, toastAtom } from "../lib/atoms"; // Healthの表示状態を保持する共有atom（/ が更新した値を読む）
import styles from "./LoginPage.module.css"; // CSS Modulesを読み込む（仕様書：import styles from "./Xxx.module.css"）:contentReference[oaicite:5]{index=5}
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { apiClient } from './../lib/apiClient';

export default function LoginPage() { // /login で表示するページ（表示だけ）

  const healthSnapshot = useAtomValue(healthSnapshotAtom);
  const location = useLocation(); // ログインページに渡された state.from を取得する
  const setToast = useSetAtom(toastAtom); // Toast通知用のatomのSetterを取得する
  const navigate = useNavigate(); // ログイン成功時に元の画面へ戻すために使う（画面遷移）
  const queryClient = useQueryClient(); // TanStack Query の QueryClient を取得する（ // ["me"] のキャッシュを無効化して、再判定を促すために使う）

  const fromPathname = location.state?.from?.pathname || "/"; // state.from.pathname があれば使い、なければ "/" にフォールバックする
  const [email, setEmail] = useState(""); // email入力を保持する（controlled input）
  const [password, setPassword] = useState(""); // password入力を保持する（controlled input）
  const [isSubmitting, setIsSubmitting] = useState(false); // 二重送信を防ぐためのフラグ（送信中はボタンを無効化する）

  const handleSubmit = async (e) => { // フォーム送信時の処理
    e.preventDefault(); // ブラウザのデフォルト送信（ページ遷移）を止め、SPAとして処理する
    setIsSubmitting(true); // 送信中フラグを立てる

    // ログイン成功/失敗を例外で分岐するためtry/catchを使う
    try {
      await apiClient.post("/auth/login", { email, password }); // baseURL=/api と合成して POST /api/auth/login を実行する（セッションCookieがセットされる）
      await queryClient.invalidateQueries(["me"]); // invalidateQueriesで直前の401キャッシュを捨て、次の画面で /api/me を取り直せるようにする
      setToast({ open: true, type: "success", message: "ログインに成功しました。" }); // 成功通知をtoastにセットして表示する
      navigate(fromPathname, { replace: true }); // ログイン成功後、元の画面へ戻る
    } catch (error) {
      const httpStatus = error.response?.status ?? null; // AxiosエラーならHTTPステータスを取り出し、無ければnullにする
      const message = httpStatus === 401 ? "メールアドレスまたはパスワードが正しくありません（401）" : "ログインに失敗しました。"; // 401なら認証失敗メッセージ、エラーメッセージにする
      setToast({ open: true, type: "error", message }); // 失敗Toastを出す
    } finally { // 成功/失敗どちらでも必ず最後に実行する
      setIsSubmitting(false); // 送信終了としてフラグを戻す（再送信可能にする）
    }
  }; // handleSubmitここまで

  return ( // UIを返す
    <div className={styles.page}> {/* ページコンテナ（CSS Modules） */}
      <h1 className={styles.title}>ログイン</h1> {/* 見出し（ログイン画面） */}
      <p className={styles.text}>ログイン後に戻る先: {fromPathname}</p> {/* RequireAuthから渡された戻り先を表示して確認しやすくする */}
      <p className={styles.text}>Last Health: {healthSnapshot.status}</p> {/* 既存のHealth表示を残して、疎通UIを壊さない */}

      <form onSubmit={handleSubmit}> {/* 送信時に handleSubmit を呼び出すフォーム */}
        <p className={styles.text}>Email</p> {/* 入力欄のラベル（既存スタイルを使う） */}
        <input value={email} onChange={(e) => setEmail(e.target.value)} disabled={isSubmitting} /> {/* email入力（送信中は無効化して二重送信を防ぐ） */}

        <p className={styles.text}>Password</p> {/* 入力欄のラベル（既存スタイルを使う） */}
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={isSubmitting} /> {/* password入力（type=passwordで伏せ字にする） */}

        <button type="submit" disabled={isSubmitting}> {/* 送信ボタン（送信中は無効化する） */}
          {isSubmitting ? "ログイン中..." : "ログイン"} {/* 送信中は文言を変えて状態が分かるようにする */}
        </button> {/* ボタンここまで */}
      </form> {/* フォームここまで */}
    </div> // ページコンテナここまで
  );
} // LoginPageここまで
