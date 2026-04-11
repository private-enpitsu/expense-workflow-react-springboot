import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

import App from "./App"; // 既存のルートコンポーネントを読み込む

import "./styles/reset.css"; // ✅ リセットCSS
import "./index.css";
import "./styles/globals.css"; // ✅ グローバルCSS（Tailwind読み込み含む）

const rootElement = document.getElementById("root")!;

createRoot(rootElement).render(
  // Reactアプリを #root に描画する
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      {" "}
      {/* TanStack Query をアプリ全体で使えるようにする */}
      <App /> {/* 既存のApp（health確認UI）をそのまま表示する */}
    </QueryClientProvider>{" "}
    {/* Provider を閉じる（ここまでが TanStack Query の適用範囲） */}
  </StrictMode>,
);
