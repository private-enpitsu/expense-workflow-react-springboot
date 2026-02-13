/*
import RequestsListPage from './RequestsListPage';
  src/pages/RequestCreatePage.jsx // ファイルパスを明示する
  目的: /requests/new にアクセスしたときに表示される「申請作成」ページの“表示だけ”の土台を用意する // まずは画面が出る状態を作る
  呼び出し元/使用箇所: src/App.jsx の <Route path="/requests/new" element={<RequestCreatePage />} /> から表示される // どこから使われるか
  依存: react（Reactコンポーネント） // 主要依存だけを書く
  今回の変更点: RequestCreatePage（表示のみ）を新規追加した // 今回のAxisに一致
  入出力: Props なし / 画面表示のみ（API通信なし） // 未来依存を避ける
  注意点: 認証ガードや POST /api/requests 接続はこの回では行わない（L0/L1のため） // 概念を増やさない
*/

import { useMutation, useQueryClient } from "@tanstack/react-query"; // POSTの状態管理と一覧キャッシュ無効化のために useMutation と useQueryClient を使う
import { useSetAtom } from "jotai"; // Toast表示のために atom へ書き込む関数を取得する
import { useState } from "react"; // フォーム入力をローカルstateで保持するために useState を使う
import { useNavigate } from "react-router-dom"; // 作成成功後に一覧へ遷移するために useNavigate を使う
import { toastAtom } from "../lib/atoms"; // 成功/失敗の通知に使う toastAtom を読み込む
import { apiClient } from "../lib/apiClient"; // /api を呼ぶ共通クライアントを使ってPOSTする

import styles from "./RequestCreatePage.module.css";

export default function RequestsCreatePage() { // /requests/new のページコンポーネントを定義する（表示だけ）

  const navigate = useNavigate(); // 成功時に /requests へ移動するための関数を取得する
  const queryClient = useQueryClient(); // 成功時に ["requests"] を invalidate するためのクライアントを取得する
  const setToast = useSetAtom(toastAtom); // 成功/失敗をToastで表示するための setter を取得する
  const [title, setTitle] = useState(""); // 件名（仮）の入力値
  const [amount, setAmount] = useState(""); // 金額（仮）の入力値（まずは文字列で保持）
  const [note, setNote] = useState(""); // 備考（仮）の入力値

  const createMutation = useMutation({ // 送信時に実行する処理を関数として定義する
    mutationFn: async () => { // 申請作成のための非同期関数を定義する
      const amountNumber = Number(amount || 0); // 文字列の金額を数値へ変換して、バックエンドの int と揃える
      const body = { title, amount: amountNumber, note }; // バックエンドが受け取るJSONの形に合わせてボディを組み立てる
      const res = await apiClient.post("/requests", body); // POST /api/requests を呼び出す（baseURL=/api は apiClient 側で設定済み）
      return res.data; // 作成された申請データを返す
    },
    onSuccess: async (created) => { // 作成成功時の処理
      await queryClient.invalidateQueries({ queryKey: ["requests"] }); // 一覧を再取得するためのクエリを無効化する
      setToast({ open: true, type: "success", message: `申請が作成されました: ${created?.id ?? ""}` }); // 作成できたことをToastで通知する
      navigate("/requests", { replace: true }); // 一覧へ戻って、作成前フォームに戻りにくくする
    },
    onError: (error) => { // 作成失敗時の処理
      const status = error?.response?.status ?? null; // AxiosエラーならHTTPステータスを取り出す
      const msg = status ? `HTTP ${status}` : String(error); // 画面に出す文字列を最小の形で組み立てる
      setToast({ open: true, type: "error", message: `作成に失敗しました: ${msg}` }); // 失敗理由をToastで通知する
    }
  });

  const isSubmitting = createMutation.isPending; // 送信中かどうかを分かりやすい名前にしてUIで使う

  return ( // 画面として返すJSXを開始する
    <div className={styles.container}> {/* 余白などの見た目を CSS Modules 側へ移すためのコンテナにする */}
      <h1>申請作成</h1> {/* ページの見出しを表示する */}
      <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(); }} className={styles.form}> {/* form のレイアウトを CSS Modules へ移して inline style を撤去する */}
        <label className={styles.field}> {/* label のレイアウトを CSS Modules へ移して inline style を撤去する */}
          <span>件名</span> {/* 件名のラベル文字を表示する */}
          <input value={title} onChange={(e) => setTitle(e.target.value)} disabled={isSubmitting} placeholder="例）交通費精算" /> {/* 件名の入力を受け取り、送信中は操作できないようにする */}
        </label> {/* 件名入力のまとまりを閉じる */}
        <label className={styles.field}> {/* label のレイアウトを CSS Modules へ移して inline style を撤去する */}
          <span>金額</span> {/* 金額のラベル文字を表示する */}
          <input value={amount} onChange={(e) => setAmount(e.target.value)} disabled={isSubmitting} placeholder="例）1200" inputMode="numeric" /> {/* 金額の入力を受け取り、送信中は操作できないようにする */}
        </label> {/* 金額入力のまとまりを閉じる */}
        <label className={styles.field}> {/* label のレイアウトを CSS Modules へ移して inline style を撤去する */}
          <span>備考</span> {/* 備考のラベル文字を表示する */}
          <textarea value={note} onChange={(e) => setNote(e.target.value)} disabled={isSubmitting} placeholder="例）領収書あり" rows={4} /> {/* 備考の入力を受け取り、送信中は操作できないようにする */}
        </label> {/* 備考入力のまとまりを閉じる */}
        <button type="submit" disabled={isSubmitting}> {isSubmitting ? "送信中..." : "作成"} </button> {/* 送信中は押せないようにして二重送信を防ぐ */}
      </form> {/* フォームを閉じる */}
    </div> // ページコンテナを閉じる
  );
}


