/*
import RequestsListPage from './RequestsListPage';
  src/pages/RequestCreatePage.jsx // ファイルパスを明示する
  目的: /requests/new にアクセスしたときに表示される「申請作成」ページの“表示だけ”の土台を用意する // まずは画面が出る状態を作る
  呼び出し元/使用箇所: src/App.jsx の <Route path="/requests/new" element={<RequestCreatePage />} /> から表示される // どこから使われるか
  依存: react（Reactコンポーネント） // 主要依存だけを書く
  今回の変更点: RequestCreatePage（表示のみ）を新規追加した // 今回のAxisに一致
  入出力: Props なし / 画面表示のみ（API通信なし） // 未来依存を避ける
  注意点: 認証ガードや POST /api/requests 接続はこの回では行わない（L0/L1のため） // 概念を増やさない
*/

import { useState } from "react";


export default function RequestsCreatePage() { // /requests/new のページコンポーネントを定義する（表示だけ）
  const [title, setTitle] = useState(""); // 件名（仮）の入力値
  const [amount, setAmount] = useState(""); // 金額（仮）の入力値（まずは文字列で保持）
  const [note, setNote] = useState(""); // 備考（仮）の入力値

  const handleSubmit = (e) => { // 送信ボタン押下時の処理（現時点は送信しない）
    e.preventDefault(); // ブラウザ標準のフォーム送信を止める
    alert("まだ送信は未実装です（表示だけ）");
    // ここでフォーム送信処理を実装予定（今回は表示のみ）
  }

  return (
    <div style={{ padding: 16 }}> {/* 余白を付けて見やすくする */}
      <h1>申請作成（仮）</h1> {/* ページの見出し */}

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12, maxWidth: 520 }}> {/* 簡易フォーム（表示だけ） */}
        <label style={{ display: "grid", gap: 4 }}> {/* 件名入力のラベル */}
          <span>件名</span> {/* ラベルテキスト */}
          <input
            value={title} // state を表示に反映
            onChange={(e) => setTitle(e.target.value)} // 入力された値を state に反映
            placeholder="例）交通費精算" // 入力例
          /> {/* 件名 input */}
        </label> {/* 件名 label */}

        <label style={{ display: "grid", gap: 4 }}> {/* 金額入力のラベル */}
          <span>金額</span> {/* ラベルテキスト */}
          <input
            value={amount} // state を表示に反映
            onChange={(e) => setAmount(e.target.value)} // 入力された値を state に反映
            placeholder="例）1200" // 入力例
            inputMode="numeric" // モバイル等で数字キーボードを出しやすくする
          /> {/* 金額 input */}
        </label> {/* 金額 label */}

        <label style={{ display: "grid", gap: 4 }}> {/* 備考入力のラベル */}
          <span>備考</span> {/* ラベルテキスト */}
          <textarea
            value={note} // state を表示に反映
            onChange={(e) => setNote(e.target.value)} // 入力された値を state に反映
            placeholder="例）領収書あり" // 入力例
            rows={4} // テキストエリアの高さ（目安）
          /> {/* 備考 textarea */}
        </label> {/* 備考 label */}

        <button type="submit">作成（未実装）</button> {/* 送信ボタン（今はアラートのみ） */}
      </form> {/* form 終わり */}

      <div style={{ marginTop: 12, fontSize: 12, opacity: 0.7 }}> {/* 補足テキスト（表示だけ） */}
        入力値: title={JSON.stringify(title)}, amount={JSON.stringify(amount)}, note={JSON.stringify(note)} {/* 今は動作確認用に表示 */}
      </div> {/* 補足 終わり */}
    </div> // ページ全体の終わり
  );
}


