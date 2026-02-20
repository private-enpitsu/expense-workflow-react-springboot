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

export default function RequestCreatePage() { // /requests/new のページコンポーネントを定義する（新規作成フォームで保存/提出を行う）
  const navigate = useNavigate(); // 成功時に詳細へ移動するための関数を取得する
  const queryClient = useQueryClient(); // 成功時にキャッシュを無効化するためのクライアントを取得する
  const setToast = useSetAtom(toastAtom); // 成功/失敗をToastで表示するための setter を取得する
  const [title, setTitle] = useState(""); // 件名の入力値を state で保持する
  const [amount, setAmount] = useState(""); // 金額の入力値（文字列）を state で保持する
  const [note, setNote] = useState(""); // 備考の入力値を state で保持する

  const createMutation = useMutation({ // 「保存（下書き作成）」として使う mutation を定義する
    mutationFn: async () => { // DRAFT作成（POST /api/requests）を行う非同期関数を定義する
      const amountNumber = Number(amount || 0); // 文字列の金額を数値へ変換してAPIへ送る準備をする
      const body = { title, amount: amountNumber, note }; // 作成APIが受け取る形に合わせてリクエストボディを作る
      const res = await apiClient.post("/requests", body); // POST /api/requests を呼び出して下書きを作成する
      return res.data; // 作成された申請データ（id等）を返す
    },
    onSuccess: async (created) => { // 保存成功時の処理を定義する
      await queryClient.invalidateQueries({ queryKey: ["requests"] }); // 一覧を再取得するために requests を無効化する
      setToast({ open: true, type: "success", message: `保存しました: ${created?.id ?? ""}` }); // 保存できたことをToastで通知する
      navigate(created?.id ? `/requests/${created.id}` : "/requests", { replace: true }); // 作成されたIDが取れれば詳細へ、取れなければ一覧へ遷移する
    },
    onError: (error) => { // 保存失敗時の処理を定義する
      const status = error?.response?.status ?? null; // AxiosエラーならHTTPステータスを取り出す
      const msg = status ? `HTTP ${status}` : String(error); // 表示用メッセージを最小で組み立てる
      setToast({ open: true, type: "error", message: `保存に失敗しました: ${msg}` }); // 失敗理由をToastで通知する
    },
  }); // createMutation

  const submitNewMutation = useMutation({ // 「提出（作成→submit）」として使う mutation を定義する
    mutationFn: async () => { // 新規作成後に submit を呼ぶ非同期関数を定義する
      const amountNumber = Number(amount || 0); // 文字列の金額を数値へ変換してAPIへ送る準備をする
      const body = { title, amount: amountNumber, note }; // 作成APIが受け取る形に合わせてリクエストボディを作る
      const createdRes = await apiClient.post("/requests", body); // POST /api/requests を呼び出して下書きを作成する
      const created = createdRes.data; // 作成結果（id等）を取り出して次のsubmitに使う
      const newId = created?.id ?? null; // submit対象のIDを取り出し、無ければnullにする
      if (!newId) { throw new Error("created.id is missing"); } // 作成に成功してもidが無い場合はsubmitできないので例外にする
      await apiClient.post(`/requests/${newId}/submit`); // POST /api/requests/{id}/submit を呼び出して提出（SUBMITTED）へ遷移させる
      return { id: newId }; // 成功後に遷移先を組み立てるため、idだけ返す
    },
    onSuccess: async (result) => { // 提出成功時の処理を定義する
      await queryClient.invalidateQueries({ queryKey: ["requests"] }); // 申請一覧を再取得するために requests を無効化する
      await queryClient.invalidateQueries({ queryKey: ["inbox"] }); // 承認者Inboxへ反映させるために inbox を無効化する
      setToast({ open: true, type: "success", message: `提出しました: ${result?.id ?? ""}` }); // 提出できたことをToastで通知する
      navigate(result?.id ? `/requests/${result.id}` : "/requests", { replace: true }); // 提出後は詳細へ遷移して状態を確認できるようにする
    },
    onError: (error) => { // 提出失敗時の処理を定義する
      const status = error?.response?.status ?? null; // AxiosエラーならHTTPステータスを取り出す
      const msg = status ? `HTTP ${status}` : String(error); // 表示用メッセージを最小で組み立てる
      setToast({ open: true, type: "error", message: `提出に失敗しました: ${msg}` }); // 失敗理由をToastで通知する
    },
  }); // submitNewMutation

  const isSubmitting = Boolean(createMutation.isPending || submitNewMutation.isPending); // 保存/提出のどちらかが進行中なら送信中として扱う
  const canSubmit = Boolean(title.trim().length > 0); // 最低限、件名が空のときは保存/提出を押せないようにする

  return ( // 画面として返すJSXを開始する
    <div className={styles.container}> {/* 見た目を CSS Modules 側へ寄せるためのコンテナを使う */}
      <h1>申請作成</h1> {/* ページの見出しを表示する */}
      <form
        onSubmit={(e) => { e.preventDefault(); if (!canSubmit) return; createMutation.mutate(); }} // Enter送信は「保存（下書き作成）」として扱う
        className={styles.form} // form のレイアウトを CSS Modules へ寄せる
      >
        <label className={styles.field}> {/* 入力行のレイアウトを CSS Modules へ寄せる */}
          <span>件名</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} disabled={isSubmitting} placeholder="例）交通費精算" /> {/* 件名の入力を受け取り、送信中は操作できないようにする */}
        </label>
        <label className={styles.field}> {/* 入力行のレイアウトを CSS Modules へ寄せる */}
          <span>金額</span>
          <input value={amount} onChange={(e) => setAmount(e.target.value)} disabled={isSubmitting} placeholder="例）1200" inputMode="numeric" /> {/* 金額の入力を受け取り、送信中は操作できないようにする */}
        </label>
        <label className={styles.field}> {/* 入力行のレイアウトを CSS Modules へ寄せる */}
          <span>備考</span>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} disabled={isSubmitting} placeholder="例）領収書あり" rows={4} /> {/* 備考の入力を受け取り、送信中は操作できないようにする */}
        </label>

        <button type="submit" disabled={isSubmitting || !canSubmit}> {/* 保存ボタンとして submit を使い、送信中や件名空では押せないようにする */}
          {isSubmitting ? "処理中..." : "保存"} {/* 送信中は表示を変えて二重送信を防ぐ */}
        </button>

        <button type="button" disabled={isSubmitting || !canSubmit} onClick={() => submitNewMutation.mutate()}> {/* 提出ボタンは作成→submitを行うため button でクリック処理にする */}
          {isSubmitting ? "処理中..." : "提出"} {/* 送信中は表示を変えて二重送信を防ぐ */}
        </button>
      </form>
    </div>
  );
} // RequestCreatePage


