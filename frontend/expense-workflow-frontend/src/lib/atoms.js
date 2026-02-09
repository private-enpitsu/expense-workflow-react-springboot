/*
  src/lib/atoms.js // ファイルパス（どこを編集しているかを明確にする）
  目的: アプリ全体で共有する状態（Jotai atom）を1箇所に集約して export する // 役割を固定して迷子を防ぐ
  呼び出し元/使用箇所: src/App.jsx（HealthがhealthSnapshotAtomへ書き込む）, src/pages/LoginPage.jsx（LoginがhealthSnapshotAtomを読む） // どこから使うか
  入力と出力: 入力なし（atom定義のみ）/ 出力は各atom（sessionAtom, healthSnapshotAtom） // 何を提供するか
  依存/前提: jotai が package.json に導入済みであること（import { atom } が解決できること） // 依存関係
  今回の変更点: healthSnapshotAtom を追加し、/（Health）で更新した状態を /login で参照できるようにした // 今回の増分（1行）
*/

import { atom } from "jotai";

export const sessionAtom = atom({ user: null, isAuthenticated: false }); // 既存: セッション状態（今回は未使用のまま残す）

export const healthSnapshotAtom = atom({ // Healthの“表示状態”を他画面から参照するための共有atom
  status: "未確認", // 初期ローディング（初期は通信中ではない）
  isLoading: false, // 初期エラー（初期はエラーなし）
  errorMessage: ""   // 初期エラー（初期はエラーなし）
})

export const toastAtom = atom({ // アプリ共通のToast（成功/失敗メッセージ）を表示するための共有atom
  open: false, // 表示中かどうか（falseならToastHostは何も描画しない）
  type: "success", // 表示種別（"success" または "error" を想定する）
  message: "" // 画面に表示するメッセージ本文（空なら通常は表示しない想定）
}); // 追加: グローバルなトースト通知用atom（nullなら非表示、文字列なら表示）