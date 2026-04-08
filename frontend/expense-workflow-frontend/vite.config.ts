import { defineConfig } from "vite"; // Vite設定を定義するための関数を読み込む
import react from "@vitejs/plugin-react"; // React用プラグインを読み込む
import tailwindcss from "@tailwindcss/vite"; // Tailwind用プラグインを読み込む

export default defineConfig({ // Viteの設定をエクスポートする
  plugins: [react(), tailwindcss()], // React と Tailwind を有効化する
  server: { // 開発サーバ設定を行う
    proxy: { // 開発時に /api をバックエンドへ中継する
      "/api": { // /api で始まるリクエストを対象にする
        target: "http://localhost:8080", // Spring Boot 側へ転送する
        changeOrigin: true // オリジンを転送先に合わせてCORS問題を減らす
      }
    }
  }
});
