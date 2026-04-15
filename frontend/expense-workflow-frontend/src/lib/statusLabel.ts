/*
申請ステータス（内部コード）をUI表示用の日本語ラベルへ変換する関数を提供する。
*/

// ステータス・アクションコードをリテラル型で定義して誤字をコンパイル時に検出する
export type StatusCode = keyof typeof STATUS_LABEL_MAP;
export type ActionCode = keyof typeof ACTION_LABEL_MAP;

// 内部コード→表示ラベルの対応表を1箇所に固定して二重定義を防ぐ
const STATUS_LABEL_MAP = {
  DRAFT: "下書き",
  SUBMITTED: "提出済み",
  APPROVED: "承認済み",
  RETURNED: "差戻し",
  WITHDRAWN: "取り下げ",
  REJECTED: "却下",
};

// ステータス文字列を表示ラベルへ変換する関数を公開する
export function toStatusLabel(status: unknown): string {
  if (typeof status !== "string") return "";
  return STATUS_LABEL_MAP[status as StatusCode] ?? status;
}

// 数値IDをUI表示用のREQ-xxx形式へ変換する関数を公開する（表示変換のSOT）
export function toRequestLabel(id: number | string | null | undefined): string {
  if (id === null || id === undefined) return "";
  const num = Number(id);
  if (!Number.isInteger(num) || num <= 0) return String(id);
  return "REQ-" + String(num).padStart(3, "0");
}

// 目的：actionコードを日本語ラベルに変換するSOT
const ACTION_LABEL_MAP = {
  SUBMIT: "提出",
  APPROVE: "承認",
  RETURN: "差戻し",
  WITHDRAW: "取り下げ",
  REJECT: "却下",
};

export function toActionLabel(action: unknown): string {
  if (typeof action !== "string") return "";
  return ACTION_LABEL_MAP[action as ActionCode] ?? action;
}
