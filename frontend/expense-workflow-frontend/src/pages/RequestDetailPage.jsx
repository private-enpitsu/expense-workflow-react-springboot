/*
  src/pages/RequestDetailPage.jsx // ファイルパスを明示する
  目的: /requests/:id の「申請詳細」ページで詳細表示を行い、RETURNED のときだけ編集して保存（PATCH）できるUIを提供する // このAxisの目的を説明する
  呼び出し元/使用箇所: src/App.jsx の <Route path="/requests/:id" element={<RequestDetailPage />} /> から表示される // どこから使われるかを説明する
  入力と出力: 入力=URLの :id（useParams） / 出力=詳細表示＋（RETURNED時のみ）編集フォーム＋保存ボタン // 入出力を説明する
  依存／前提: react, react-router-dom, @tanstack/react-query, jotai, apiClient, statusLabel // 主要依存を列挙する
  今回の変更点: RETURNED のときだけ編集UIを表示し、PATCH /api/requests/{id} で「編集して保存」を成立させる // 変更点を説明する
*/

import { useState } from "react"; // 取得後にフォームへ初期値を流し込むために useEffect/useState を使う
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"; // 詳細取得と更新/提出のmutationにTanStack Queryを使う
import { useSetAtom } from "jotai"; // Toast を出すために jotai atom へ書き込む setter を取得する
import { useParams, Link } from "react-router-dom"; // URLパラメータ取得（useParams）と一覧へ戻るリンク（Link）を使う

import { toastAtom } from "../lib/atoms"; // 成功/失敗の通知に使う toastAtom を読み込む
import { apiClient } from "../lib/apiClient"; // baseURL=/api の共通クライアントで API を呼ぶ
import { toStatusLabel } from "../lib/statusLabel"; // ステータス表示を日本語化する変換関数を読み込む

export default function RequestDetailPage() { // /requests/:id のページコンポーネントを定義する
  const params = useParams(); // URLパラメータ（/requests/:id）から値を取得して、どの申請の詳細かを特定する
  const requestId = params.id; // :id の値を requestId として扱い、APIのURL組み立てに使う

  const queryClient = useQueryClient(); // invalidateQueries を行うために QueryClient を取得する
  const setToast = useSetAtom(toastAtom); // Toast を出すための setter を取得する

  const [editTitle, setEditTitle] = useState(""); // RETURNED 編集用の title 入力値を state で保持する
  const [editAmount, setEditAmount] = useState(""); // RETURNED 編集用の amount 入力値（文字列）を state で保持する
  const [editNote, setEditNote] = useState(""); // RETURNED 編集用の note 入力値を state で保持する
  const [isEditStarted, setIsEditStarted] = useState(false); // 編集UIが表示されたかを保持する（初期値は false）

  const fetchRequestDetail = async () => { // GET /api/requests/{id} の取得処理を関数に切り出す
    const res = await apiClient.get(`/requests/${requestId}`); // baseURL=/api と合成して GET /api/requests/{id} を実行する
    return res.data; // 画面表示に使うレスポンスボディだけを返す
  }; // fetchRequestDetail の定義を終える

  const submitMutation = useMutation({ // 提出（submit）を実行する mutation を定義する
    mutationFn: async () => { // 提出APIを呼ぶ非同期関数を定義する
      const res = await apiClient.post(`/requests/${requestId}/submit`); // POST /api/requests/{id}/submit を呼び出して状態遷移させる
      return res.data; // 成功時レスポンスがあれば返す（使わなくても一旦返す）
    }, // mutationFn の定義を終える
    onSuccess: async () => { // 提出成功後の処理を定義する
      await queryClient.invalidateQueries({ queryKey: ["requests"] }); // 一覧（My Requests）を再取得させるために無効化する
      await queryClient.invalidateQueries({ queryKey: ["request", requestId] }); // 詳細（いま開いている申請）を再取得させるために無効化する
      await queryClient.invalidateQueries({ queryKey: ["inbox"] }); // Inbox（承認者側）に反映させるために無効化する
      setToast({ open: true, type: "success", message: "提出しました" }); // 成功したことをToastで通知する
    }, // onSuccess の定義を終える
    onError: (error) => { // 提出失敗時の処理を定義する
      const status = error?.response?.status ?? null; // AxiosエラーならHTTPステータスを取り出す
      const msg = status ? `HTTP ${status}` : String(error); // 表示用メッセージを最小で組み立てる
      setToast({ open: true, type: "error", message: `提出に失敗しました: ${msg}` }); // 失敗理由をToastで通知する
    }, // onError の定義を終える
  }); // submitMutation の定義を終える

const saveMutation = useMutation({ // RETURNED の申請を「編集して保存」する mutation を定義する
    mutationFn: async () => { // 保存API（PATCH）を呼ぶ非同期関数を定義する
      const titleForSave = isEditStarted ? editTitle : (data?.title ?? ""); // 未編集なら data の値を使い、編集開始後は state の値を使う
      const amountTextForSave = isEditStarted ? editAmount : String(data?.amount ?? 0); // 未編集なら data の金額を文字列化して使い、編集開始後は state を使う
      const noteForSave = isEditStarted ? editNote : (data?.note ?? ""); // 未編集なら data の備考を使い、編集開始後は state の値を使う
      const numericAmount = Number(amountTextForSave); // 保存対象の金額文字列を数値へ変換してAPIへ送る準備をする
      const safeAmount = Number.isFinite(numericAmount) ? numericAmount : 0; // 数値変換できない場合は 0 を送って落ちないようにする
      const payload = { title: titleForSave, amount: safeAmount, note: noteForSave }; // UpdateRequestRequest 相当のJSONを組み立てる
      const res = await apiClient.patch(`/requests/${requestId}`, payload); // PATCH /api/requests/{id} を呼んで内容更新を行う
      return res.data; // 204想定だが、念のため data を返す（使わなくてもよい）
    }, // mutationFn の定義を終える
    onSuccess: async () => { // 保存成功後の処理を定義する
      await queryClient.invalidateQueries({ queryKey: ["request", requestId] }); // 詳細を再取得して画面へ反映させる
      await queryClient.invalidateQueries({ queryKey: ["requests"] }); // 一覧側にも反映させるために無効化する
      setToast({ open: true, type: "success", message: "保存しました" }); // 保存できたことをToastで通知する
    }, // onSuccess の定義を終える
    onError: (error) => { // 保存失敗時の処理を定義する
      const status = error?.response?.status ?? null; // AxiosエラーならHTTPステータスを取り出す
      const msg = status ? `HTTP ${status}` : String(error); // 表示用メッセージを最小で組み立てる
      setToast({ open: true, type: "error", message: `保存に失敗しました: ${msg}` }); // 失敗理由をToastで通知する
    }, // onError の定義を終える
  }); // saveMutation の定義を終える

  const { data, isLoading, error } = useQuery({ // 申請詳細データを取得するための useQuery を使う
    queryKey: ["request", requestId], // キャッシュキーに requestId を含めて、IDごとにキャッシュを分ける
    queryFn: fetchRequestDetail, // 先ほど定義した取得関数を使う
    enabled: typeof requestId === "string" && requestId.length > 0, // requestId が空のときは取得しない（無駄なリクエストを防ぐ）
  }); // useQuery の呼び出しを終える

  // useEffect(() => { // 詳細データ取得後にフォーム初期値を流し込む（RETURNED編集UIのため）
  //   if (!data) return; // data が無い間は何もしない
  //   if (isEditInitialized) return; // すでに初期化済みなら上書きしない（入力途中の破壊を防ぐ）
  //   setEditTitle(data.title ?? ""); // 取得した title をフォームへ反映する
  //   setEditAmount(String(data.amount ?? 0)); // 取得した amount を文字列にしてフォームへ反映する
  //   setEditNote(data.note ?? ""); // 取得した note をフォームへ反映する
  //   setIsEditInitialized(true); // 初期化が完了したことを記録して、以後は上書きしないようにする
  // }, [data, isEditInitialized]); // data が取れたときだけ初期化が走るように依存配列を指定する

  const ensureEditDraft = () => { // 編集開始時に data から state へ初期値をコピーする関数を定義する（useEffect を使わない）
    if (!data) return; // data が無いなら初期化できないので何もしない
    if (isEditStarted) return; // すでに編集開始済みなら上書きしない（入力途中の破壊を防ぐ）
    setEditTitle(data.title ?? ""); // 現在の詳細データの title を state へコピーして編集の起点にする
    setEditAmount(String(data.amount ?? 0)); // 現在の詳細データの amount を文字列化して state へコピーする
    setEditNote(data.note ?? ""); // 現在の詳細データの note を state へコピーして編集の起点にする
    setIsEditStarted(true); // 以後は state を編集内容の正として扱うため編集開始フラグを立てる
  };

  const errorLabel = error ? (error.response?.status ? `HTTP ${error.response.status}` : String(error)) : ""; // エラーがあればHTTPステータス等を短く表示する

  const canEditReturned = Boolean(data && data.status === "RETURNED"); // RETURNED のときだけ編集UIを出すための判定を作る
  const canSubmit = Boolean( data && (data.status === "DRAFT" || data.status === "RETURNED")
  );
  return ( // 画面の表示を返す
    <div> {/* 画面のルート要素を定義する */}
      <h1>申請詳細</h1> {/* 画面の見出しを表示する */}
      <p>申請ID：{requestId}</p> {/* いま見ている申請IDを表示して確認できるようにする */}

      {isLoading ? ( // ローディング中の分岐を開始する
        <p>Loading...</p> // ローディング中の表示を行う
      ) : error ? ( // エラー時の分岐を開始する
        <p>エラー：{errorLabel}</p> // エラー要約を表示して、Network/ログと紐付けられるようにする
      ) : data ? ( // 成功時（dataが取れた）の分岐を開始する
        <div> {/* 詳細表示ブロックを開始する */}
          <p>件名：{data.title}</p> {/* 詳細データの件名を表示する */}
          <p>金額：{data.amount}</p> {/* 詳細データの金額を表示する */}
          <p>状態：{toStatusLabel(data.status)}</p> {/* 詳細データの状態を日本語ラベルに変換して表示する */}
          <p>備考：{data.note}</p> {/* 詳細データの備考を表示する */}
          <p>履歴件数：{Array.isArray(data.actions) ? data.actions.length : 0}</p> {/* actions配列の件数を表示して「配列が返っている」ことを確認する */}

          {canEditReturned ? ( // RETURNED のときだけ編集UIを表示する
            <div> {/* 編集UIブロックを開始する */}
              <h2>差戻し内容の編集</h2> {/* RETURNEDのときの編集見出しを表示する */}

              <div> {/* フォーム行を開始する */}
                <label>件名</label> {/* 入力項目名を表示する */}
                <input // 件名の入力欄を表示する
                  value={isEditStarted ? editTitle : (data.title ?? "")} // 編集前は data を表示し、編集開始後は state を表示する
                  onFocus={() => ensureEditDraft()} // フォーカスした時点で data→state を1回だけコピーして編集を開始する
                  onChange={(e) => { // 入力が変わったときの処理を定義する
                    ensureEditDraft(); // 入力反映の前に編集開始を確実にして起点を揃える
                    setEditTitle(e.target.value); // 入力された文字列を state に保存して編集内容を保持する
                  }} // onChange の定義を終える
                /> {/* title を編集できるようにする */}
              </div> {/* フォーム行を閉じる */}

              <div> {/* フォーム行を開始する */}
                <label>金額</label> {/* 入力項目名を表示する */}
                <input // 金額の入力欄を表示する
                  value={isEditStarted ? editAmount : String(data.amount ?? 0)} // 編集前は data を表示し、編集開始後は state を表示する
                  onFocus={() => ensureEditDraft()} // フォーカスした時点で data→state を1回だけコピーして編集を開始する
                  onChange={(e) => { // 入力が変わったときの処理を定義する
                    ensureEditDraft(); // 入力反映の前に編集開始を確実にして起点を揃える
                    setEditAmount(e.target.value); // 入力された文字列を state に保存して編集内容を保持する
                  }} // onChange の定義を終える
                  inputMode="numeric" // 数字入力を促すための入力モードを指定する
                /> {/* amount を編集できるようにする */}
              </div> {/* フォーム行を閉じる */}

              <div> {/* フォーム行を開始する */}
                <label>備考</label> {/* 入力項目名を表示する */}
                <textarea // 備考の入力欄を表示する
                  value={isEditStarted ? editNote : (data.note ?? "")} // 編集前は data を表示し、編集開始後は state を表示する
                  onFocus={() => ensureEditDraft()} // フォーカスした時点で data→state を1回だけコピーして編集を開始する
                  onChange={(e) => { // 入力が変わったときの処理を定義する
                    ensureEditDraft(); // 入力反映の前に編集開始を確実にして起点を揃える
                    setEditNote(e.target.value); // 入力された文字列を state に保存して編集内容を保持する
                  }} // onChange の定義を終える
                /> {/* note を編集できるようにする */}
              </div> {/* フォーム行を閉じる */}

              <button
                type="button" // form 送信ではなくクリック操作として扱う
                onClick={() => saveMutation.mutate()} // クリックで保存（PATCH）を実行する
                disabled={saveMutation.isPending} // 送信中は二重送信を避けるため無効化する
              >
                {saveMutation.isPending ? "保存中..." : "保存"} {/* 送信中は表示を変えて二重送信を避ける */}
              </button>
            </div> // 編集UIブロックを閉じる
          ) : null} {/* RETURNED以外は編集UIを出さない */}

          <button
            type="button"
            onClick={() => submitMutation.mutate()}
            disabled={!canSubmit || submitMutation.isPending}
          >
            {submitMutation.isPending ? "提出中..." : "提出"}
          </button>
        </div> // 詳細表示ブロックを閉じる
      ) : ( // enabled=false 等で data が無い場合の分岐を開始する
        <p>データがありません</p> // 取得できなかった場合の表示を行う
      )}

      <p> {/* 戻るリンクの行を開始する */}
        <Link to="/requests">一覧に戻る</Link> {/* クリックで申請一覧（/requests）へ戻る */}
      </p> {/* 戻るリンクの行を閉じる */}
    </div> // 画面のルート要素を閉じる
  );
}
