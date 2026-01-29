import { useEffect, useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.css'
import { apiClient } from './lib/apiClient';

function App() { // ルートコンポーネント（health確認をここで行う）
  const [status, setStatus] = useState("未確認"); // healthの結果（ok等）を表示するための状態を持つ
  const [error, setError] = useState(""); // エラー内容を表示するための状態を持つ
  const [isLoading, setIsLoading] = useState(false); // 読み込み中かどうかを表示するための状態を持つ
  //

  useEffect(() => { // 画面が最初に表示されたタイミングでhealthを叩く

    const fetchHealth = async () => { // health APIを呼ぶ非同期関数を定義する（useEffect内で使う）
      setIsLoading(true); // 呼び出し開始なのでローディングをONにする
      setError(""); // 前回のエラー表示が残らないように初期化する
      try {
        const res = await apiClient.get("/api/health"); // AxiosでGET /api/health を実行する（baseURLはapiClient側）
        setStatus(res.data?.status ?? "不明"); // レスポンスJSONのstatusを表示する（無い場合は不明）
      } catch (e) {
        const message = e?.response ? `HTTP ${e.response.status}` : String(e); // HTTP応答がある場合はステータス、無い場合は文字列化する
        setError(message); // 画面に出せるようエラー状態に入れる
        setStatus("失敗"); // ステータス表示も失敗にして分かりやすくする
      } finally { // 成功でも失敗でも最後に必ず行う処理
        setIsLoading(false); // 呼び出し終了なのでローディングをOFFに戻す
      }
    }

    fetchHealth(); // 実際にhealth APIを呼び出して結果を画面に反映する

  },[]); // 依存配列を空にして、初回マウント時に1回だけ実行する

  return (
    <>
    <div style={{ padding: 16 }}>
      <h1>Health Check</h1>
      <p>Loading: {String(isLoading)}</p> {/* 通信中かどうかを表示する */}
      <p>Status: {status}</p> {/* healthの結果（ok/失敗など）を表示する */}
      {error && <p style={{ whiteSpace: "pre-wrap" }}>Error: {error}</p>} {/* エラーがあるときだけ詳細を表示する */}
      <p>Backend URL: http://localhost:8080/api/health</p> {/* 叩いているURLを明示して切り分けしやすくする */}
    </div>

    </>
  )
}

export default App
