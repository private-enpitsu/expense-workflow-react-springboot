"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { useMeQuery } from "../hooks/useMeQuery";

export default function RequireAuth({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoading, error, httpStatus } = useMeQuery();

  useEffect(() => {
    if (!isLoading && httpStatus === 401) {
      router.replace(`/login?from=${pathname}`);
    }
  }, [isLoading, httpStatus, router, pathname]);

  if (isLoading) {
    return <div>Checking session...</div>;
  }

  if (httpStatus === 401) {
    return null;
  }

  if (error) {
    return <div>An error occurred: {String(error)}</div>;
  }

  return <>{children}</>;
}
