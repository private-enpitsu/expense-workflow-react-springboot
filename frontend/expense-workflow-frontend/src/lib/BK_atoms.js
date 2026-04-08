/*
  アプリ全体で共有する状態（Jotai atom）を1箇所に集約して export する
*/

import { atom } from "jotai";

// 既存: セッション状態（今回は未使用のまま残す）
export const sessionAtom = atom({ user: null, isAuthenticated: false });

// Healthの“表示状態”を他画面から参照するための共有atom
export const healthSnapshotAtom = atom({
  status: "未確認",
  isLoading: false,
  errorMessage: "",
});

// アプリ共通のToast（成功/失敗メッセージ）を表示するための共有atom
export const toastAtom = atom({
  open: false,
  type: "success",
  message: "",
});
