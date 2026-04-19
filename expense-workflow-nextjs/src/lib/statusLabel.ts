export type StatusCode = keyof typeof STATUS_LABEL_MAP;
export type ActionCode = keyof typeof ACTION_LABEL_MAP;

const STATUS_LABEL_MAP = {
  DRAFT: "下書き",
  SUBMITTED: "提出済み",
  APPROVED: "承認済み",
  RETURNED: "差戻し",
  WITHDRAWN: "取り下げ",
  REJECTED: "却下",
};

export function toStatusLabel(status: unknown): string {
  if (typeof status !== "string") return "";
  return STATUS_LABEL_MAP[status as StatusCode] ?? status;
}

export function toRequestLabel(id: number | string | null | undefined): string {
  if (id === null || id === undefined) return "";
  const num = Number(id);
  if (!Number.isInteger(num) || num <= 0) return String(id);
  return "REQ-" + String(num).padStart(3, "0");
}

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
