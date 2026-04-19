import { atom } from "jotai";

type Session = {
  user: null | string;
  isAuthenticated: boolean;
};
export const sessionAtom = atom<Session>({
  user: null,
  isAuthenticated: false,
});

type HealthSnapshot = {
  status: string;
  isLoading: boolean;
  errorMessage: string;
};
export const healthSnapshotAtom = atom<HealthSnapshot>({
  status: "未確認",
  isLoading: false,
  errorMessage: "",
});

type Toast = {
  open: boolean;
  type: "success" | "error" | "info" | "warning";
  message: string;
};
export const toastAtom = atom<Toast>({
  open: false,
  type: "success",
  message: "",
});
