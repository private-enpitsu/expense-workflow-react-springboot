/* 目的: 申請ステータス（内部コード）をUI表示用の日本語ラベルへ変換する関数を提供する。 */ // このファイルの役割を説明する
/* 呼び出し元: src/pages/RequestsListPage.jsx / src/pages/RequestDetailPage.jsx / src/pages/InboxPage.jsx から import して使う。 */ // どこから使われるかを書く
/* 入力と出力: 入力=ステータス文字列（例: "DRAFT"）/ 出力=表示用ラベル（例: "下書き"）。 */ // 何を受け取り何を返すかを書く
/* 依存: なし（純粋な変換関数だけ）。 */ // 依存関係が無いことを書く
/* 今回変更点: toRequestLabel を追加し、数値IDをREQ-xxx形式へ変換するSOTをこのファイルに集約した。 */

// 内部コード→表示ラベルの対応表を1箇所に固定して二重定義を防ぐ
const STATUS_LABEL_MAP = {
  DRAFT: "下書き",
  SUBMITTED: "提出済み",
  APPROVED: "承認済み",
  RETURNED: "差戻し",
  WITHDRAWN: "取り下げ",
  REJECTED:  "却下",
};

// ステータス文字列を表示ラベルへ変換する関数を公開する
export function toStatusLabel(status) {
  if (typeof status !== "string") return ""; // 文字列以外が来た場合は表示崩れを避けるため空文字を返す
  return STATUS_LABEL_MAP[status] ?? status; // 対応表にあれば日本語、無ければ元の値をそのまま返して未知値にも耐える
}

// 数値IDをUI表示用のREQ-xxx形式へ変換する関数を公開する（表示変換のSOT）
export function toRequestLabel(id) {
  if (id === null || id === undefined) return ""; // nullやundefinedが来た場合は表示崩れを避けるため空文字を返す
  const num = Number(id); // 数値・文字列どちらで来ても変換できるようにNumberへ統一する
  if (!Number.isInteger(num) || num <= 0) return String(id); // 整数でない・0以下の場合は変換不能としてそのまま返す
  return "REQ-" + String(num).padStart(3, "0"); // 3桁ゼロ埋めのREQ-xxx形式に変換して返す（例: 1 → REQ-001）
}

// 目的：actionコードを日本語ラベルに変換するSOT
const ACTION_LABEL_MAP = {
  SUBMIT:   "提出",
  APPROVE:  "承認",
  RETURN:   "差戻し",
  WITHDRAW: "取り下げ",
  REJECT:   "却下",
};

export function toActionLabel(action) {
  if (typeof action !== "string") return "";
  return ACTION_LABEL_MAP[action] ?? action;
}