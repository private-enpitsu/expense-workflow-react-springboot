import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx' // 既存のルートコンポーネントを読み込む
import { QueryClientProvider } from '@tanstack/react-query' // TanStack Query の Provider を使うために読み込む
import { queryClient } from "./lib/queryClient"; // QueryClient の実体（アプリ全体で共有）を読み込む

import "./styles/globals.css"; // ✅ グローバルCSS（Tailwind読み込み含む）

createRoot(document.getElementById('root')).render( // Reactアプリを #root に描画する
  <StrictMode>

    <QueryClientProvider client={queryClient}> {/* TanStack Query をアプリ全体で使えるようにする */}
      <App /> {/* 既存のApp（health確認UI）をそのまま表示する */}
    </QueryClientProvider> {/* Provider を閉じる（ここまでが TanStack Query の適用範囲） */}

  </StrictMode>
)
