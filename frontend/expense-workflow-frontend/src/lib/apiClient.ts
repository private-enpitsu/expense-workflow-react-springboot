/*
  フロントからバックエンドAPIを呼ぶためのAxios共通クライアントを1か所に集約する // 各画面でURLを直書きしないため
  依存: axios（HTTPクライアント） // 主要依存
*/

import axios, { AxiosInstance } from "axios";

let onSlowResponse: ((isSlow: boolean) => void) | null = null;

export const setSlowResponseHandler = (handler: (isSlow: boolean) => void) => {
  onSlowResponse = handler;
};

export const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 65000, // HikariCP 60秒待機 + 余裕5秒
  withCredentials: true,
});

// リクエスト送信時：3秒後もレスポンスがなければDB起動中とみなす
apiClient.interceptors.request.use((config) => {
  const timer = setTimeout(() => {
    onSlowResponse?.(true);
  }, 3000);
  (config as any).__slowTimer = timer;
  return config;
});

// レスポンス時：500ならリトライ（最大2回）、それ以外はオーバーレイを消す
apiClient.interceptors.response.use(
  (response) => {
    clearTimeout((response.config as any).__slowTimer);
    onSlowResponse?.(false);
    return response;
  },
  async (error) => {
    clearTimeout((error.config as any).__slowTimer);

    const config = error.config as any;
    if (error.response?.status === 500 && (config.__retryCount ?? 0) < 2) {
      config.__retryCount = (config.__retryCount ?? 0) + 1;
      onSlowResponse?.(true); // オーバーレイを維持
      await new Promise((res) => setTimeout(res, 5000)); // 5秒待ってリトライ
      return apiClient(config);
    }

    onSlowResponse?.(false);
    return Promise.reject(error);
  },
);
