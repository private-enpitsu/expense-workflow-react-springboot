/*
  src/components/ToastHost.jsx // ファイルパスを明示する
  目的: アプリ共通のToast（成功/失敗メッセージ）を画面右上に表示するための表示コンポーネントを提供する // 共通UI
*/

import { useEffect } from "react";
import { useAtom } from "jotai";
import { toastAtom } from "../lib/atoms";

import styles from "./ToastHost.module.css";

export default function ToastHost() {
  const [toast, setToast] = useAtom(toastAtom); // toastAtomの状態（open/type/message）を読み書きする // toastAtom から現在のToast状態と更新関数を取得する

  // toast.open が true になったら自動で閉じるタイマーをセットする
  useEffect(() => {
    // open が false のときは何もしない
    if (!toast.open) return;

    // 一定時間後にToastを閉じるためのタイマー
    const timerId = window.setTimeout(() => {
      // 既存メッセージは維持したまま open だけ false にする
      setToast((prev) => ({ ...prev, open: false }));
    }, 2500);

    // 依存が変わった/アンマウント時にタイマーを解除する
    return () => window.clearTimeout(timerId);

    // open の変化だけをトリガーにする（メッセージ変更では再タイマーを作らない）
  }, [toast.open, setToast]);

  // open が false のとき、return を実行し、何も描画しない
  if (!toast.open) return null;

  // typeに応じてcssクラス名を切り替える
  const variantClass =
    toast.type === "success" ? styles.toastSuccess : styles.toastError;

  // 手動で閉じるボタン押下時の処理
  const handleClose = () => {
    setToast((prev) => ({ ...prev, open: false }));
  };

  // ToastのUIを返す
  return (
    <div className={styles.host} role="status" aria-live="polite">
      <div className={`${styles.toast} ${variantClass}`}>
        <span className={styles.message}>{toast.message}</span>
        <button
          type="button"
          className={styles.closeButton}
          onClick={handleClose}
        >
          ×
        </button>
      </div>
    </div>
  );
}
