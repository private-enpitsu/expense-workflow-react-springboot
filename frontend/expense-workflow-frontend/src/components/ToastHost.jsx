/*
  src/components/ToastHost.jsx // ファイルパスを明示する
  目的: アプリ共通のToast（成功/失敗メッセージ）を画面右上に表示するための表示コンポーネントを提供する // 共通UIの土台
  呼び出し元/使用箇所: src/App.jsx から <ToastHost /> として1回だけ描画され、全ページ共通で表示できるようにする // どこから使うか
  入力と出力: 入力は jotai の toastAtom（message/type/open）/ 出力は Toast の表示（DOM） // 入出力を明示する
  依存/前提: jotai が導入済みであること、toastAtom が src/lib/atoms.js に定義されていること、CSS Modules（ToastHost.module.css）が読み込めること // 依存関係
  今回の変更点: Phase1の共通UIとして「成功/失敗Toast」を最小実装し、他画面でも使い回せる土台を追加した // 変更点を1行で
*/

import { useEffect } from "react"; // 副作用フックを読み込む // 自動クローズ（タイマー）を実装するためにuseEffectを使う
import { useAtom } from "jotai"; // Jotaiのatom読み書き用フックを読み込む // Toastの状態をatomで読む/更新するためにuseAtomを使う
import { toastAtom } from "../lib/atoms"; // 共有atom（Toast状態）を読み込む

import styles from "./ToastHost.module.css"; // CSS Modules（インラインstyle禁止のため）を読み込む

// ToastHostコンポーネントを定義する // アプリ共通で1回だけ置くToastホスト（表示担当）
export default function ToastHost() {
  const [toast, setToast] = useAtom(toastAtom); // toastAtomの状態（open/type/message）を読み書きする // toastAtom から現在のToast状態と更新関数を取得する

  useEffect(() => { // toast.open が true になったら自動で閉じるタイマーをセットする
    if (!toast.open) return; // open が false のときは何もしない

    const timerId = window.setTimeout(() => { // 一定時間後にToastを閉じるためのタイマーを作る
      setToast((prev) => ({ ...prev, open: false })); // 既存メッセージは維持したまま open だけ false にする
    }, 2500); // 2.5秒後に実行され、中のコードで open: false になり自動で閉じる（最小実装として固定値にする）

    return () => window.clearTimeout(timerId); // 依存が変わった/アンマウント時にタイマーを解除する
  }, [toast.open, setToast]); // open の変化だけをトリガーにする（メッセージ変更では再タイマーを作らない）

  if (!toast.open) return null; // open が false のとき、return を実行し、何も描画しない（最小で副作用を避ける）

  const variantClass = // typeに応じて見た目（cssクラス名）を切り替える
    toast.type === "success" ? styles.toastSuccess  :  styles.toastError;

  const handleClose = () => { // 手動で閉じるボタン押下時の処理
    setToast((prev) => ({ ...prev, open: false })); // open を false にして閉じる
  };

  return ( // ToastのUIを返す
    <div className={styles.host} role="status" aria-live="polite"> {/* 画面右上に固定表示するホスト */}
      <div className={`${styles.toast} ${variantClass}`}> {/* typeに応じた見た目でToast本体を描画する */}
        <span className={styles.message}>{toast.message}</span> {/* 伝えたいメッセージ本文を表示する */}
        <button type="button" className={styles.closeButton} onClick={handleClose}> {/* 閉じる操作を提供する */}
          × {/* 視認性の高い最小ラベル（次ステップでaria-label追加も可能） */}
        </button> {/* 閉じるボタンここまで */}
      </div> {/* Toast本体ここまで */}
    </div> // host ここまで
  ); // return ここまで
} // ToastHost ここまで

