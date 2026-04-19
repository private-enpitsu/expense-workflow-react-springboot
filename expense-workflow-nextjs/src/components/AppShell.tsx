"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSetAtom } from "jotai";
import { toastAtom } from "../lib/atoms";
import { apiClient, setSlowResponseHandler } from "../lib/apiClient";
import { useMeQuery } from "../hooks/useMeQuery";
import { AxiosError } from "axios";
import ToastHost from "./ToastHost";
import DbWakingOverlay from "./DbWakingOverlay";
import styles from "./AppShell.module.css";

function NavItem({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const isActive = pathname === href;
  return (
    <Link
      href={href}
      prefetch={false}
      className={`${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}
    >
      {label}
    </Link>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [isDbWaking, setIsDbWaking] = useState(false);
  useEffect(() => {
    setSlowResponseHandler(setIsDbWaking);
  }, []);

  const router = useRouter();
  const queryClient = useQueryClient();
  const setToast = useSetAtom(toastAtom);
  const {
    data: meData,
    isLoading: isMeLoading,
    error: meError,
    httpStatus: meHttpStatus,
  } = useMeQuery();

  const isLoggedIn = !isMeLoading && meHttpStatus !== 401 && !meError;
  const role = isLoggedIn ? (meData?.role ?? "") : "";
  const isApplicant = Boolean(isLoggedIn && role === "APPLICANT");
  const isApprover = Boolean(
    isLoggedIn && (role === "APPROVER" || role === "ADMIN"),
  );

  const meDisplay = isMeLoading
    ? "確認中..."
    : meHttpStatus === 401
      ? "Guest"
      : meError
        ? "Error"
        : (meData?.email ?? "Logged in");

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post("/auth/logout");
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["me"] });
      setToast({ open: true, type: "success", message: "ログアウトしました" });
      router.replace("/login");
    },
    onError: (error: unknown) => {
      const axiosError = error as AxiosError;
      const msg = axiosError?.response
        ? `HTTP ${axiosError.response.status}`
        : String(error);
      setToast({
        open: true,
        type: "error",
        message: `ログアウト失敗: ${msg}`,
      });
    },
  });

  return (
    <div className={styles.app}>
      <DbWakingOverlay isVisible={isDbWaking} />
      <ToastHost />
      <h1 className={styles.site_title}>Expense Workflow App</h1>
      <nav className={styles.nav}>
        <NavItem href="/" label="疎通確認" />
        {isApplicant && (
          <>
            <NavItem href="/requests" label="申請一覧" />
            <NavItem href="/requests/new" label="申請作成" />
          </>
        )}
        {isApprover && <NavItem href="/inbox" label="受信箱" />}
        <span className={styles.navUser}>{meDisplay}</span>
        <button
          className={styles.navLink}
          onClick={() => {
            if (isLoggedIn) {
              logoutMutation.mutate();
            } else {
              router.push("/login");
            }
          }}
          disabled={isMeLoading || logoutMutation.isPending}
        >
          {isLoggedIn ? "ログアウト" : "ログイン"}
        </button>
      </nav>
      <main className={styles.main}>
        <div className={styles.contentCard}>{children}</div>
      </main>
    </div>
  );
}
