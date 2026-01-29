import axios from "axios"


export const apiClient = axios.create({ // 共通設定済みのAxiosインスタンスを作り、全API呼び出しで再利用する
  baseURL: "http://localhost:8080", // バックエンドのベースURLを固定し、各画面でURL直書きを避ける
  timeout: 10000, // 通信が固まったときに待ち続けないようにタイムアウトを設定する（ms）
  // withCredentials: true, // セッションCookie運用にする場合はtrueにする（今回はhealth確認なので未設定のまま）

});