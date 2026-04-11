/*
  フロントからバックエンドAPIを呼ぶためのAxios共通クライアントを1か所に集約する // 各画面でURLを直書きしないため
  依存: axios（HTTPクライアント） // 主要依存
*/

import axios, { AxiosInstance } from "axios";

export const apiClient: AxiosInstance = axios.create({
  // 共通設定済みのAxiosインスタンスを作り、全API呼び出しで再利用する
  baseURL:
    // "https://expense-workflow-react-springboot-production.up.railway.app/api", //（★Railwayで設定したBackendのURL）
    import.meta.env.VITE_API_BASE_URL,
  // baseURL: "http://localhost:8080", // バックエンドのベースURLを固定し、各画面でURL直書きを避ける
  // baseURL: "/api",
  timeout: 10000, // 通信が固まったときに待ち続けないようにタイムアウトを設定する（ms）
  withCredentials: true, // セッションCookie運用にする場合はtrueにする（★Railway利用の際にtrueにした）
});
