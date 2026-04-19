"use client";

import { useEffect } from "react";
import { useAtom } from "jotai";
import { toastAtom } from "../lib/atoms";

import styles from "./ToastHost.module.css";

export default function ToastHost() {
  const [toast, setToast] = useAtom(toastAtom);

  useEffect(() => {
    if (!toast.open) return;

    const timerId = window.setTimeout(() => {
      setToast((prev) => ({ ...prev, open: false }));
    }, 2500);

    return () => window.clearTimeout(timerId);
  }, [toast.open, setToast]);

  if (!toast.open) return null;

  const variantClass =
    toast.type === "success" ? styles.toastSuccess : styles.toastError;

  const handleClose = () => {
    setToast((prev) => ({ ...prev, open: false }));
  };

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
