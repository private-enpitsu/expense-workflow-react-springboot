/*
  src/lib/apiClient.js // ファイルパスを明示する
  目的: フロントからバックエンドAPIを呼ぶためのAxios共通クライアントを1か所に集約する // 各画面でURLを直書きしないため
  呼び出し元/使用箇所: src/App.jsx などの各画面（useQuery等）から import { apiClient } して利用する // どこから使われるか
  依存: axios（HTTPクライアント） // 主要依存だけを書く
  今回の変更点: baseURL を /api に変更し、開発時もVite proxy経由（/api）で呼べるようにした // 今回のAxisに合わせる
  入出力: 入力=各画面の apiClient.get/post の引数（例: "/health"） / 出力=AxiosResponse（res.data等） // 使い方の入出力
  注意点: セッション（HttpOnly Cookie）運用では withCredentials を有効化するが、今回は概念を増やさないため未変更 // L1:1概念の維持
*/

import axios from "axios"; // HTTPクライアントライブラリAxiosを読み込む（以後これを共通で使う）
//                                                                 // 空行の代わり（全行コメントルール対応）

export const apiClient = axios.create({
  // 共通設定済みのAxiosインスタンスを作り、全API呼び出しで再利用する
  baseURL:
    "https://expense-workflow-react-springboot-production.up.railway.app/api", //（★Railwayで設定したBackendのURL）
  // baseURL: "http://localhost:8080", // バックエンドのベースURLを固定し、各画面でURL直書きを避ける
  // baseURL: "/api",
  timeout: 10000, // 通信が固まったときに待ち続けないようにタイムアウトを設定する（ms）
  withCredentials: true, // セッションCookie運用にする場合はtrueにする（★Railway利用の際にtrueにした）
}); // 共通クライアント定義の終わり
