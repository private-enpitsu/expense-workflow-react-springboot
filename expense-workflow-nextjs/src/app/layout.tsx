import type { Metadata } from "next";
import "./globals.css";
import Providers from "./Providers";
import AppShell from "../components/AppShell";

export const metadata: Metadata = {
  title: "Expense Workflow App",
  description: "経費申請ワークフローアプリ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
