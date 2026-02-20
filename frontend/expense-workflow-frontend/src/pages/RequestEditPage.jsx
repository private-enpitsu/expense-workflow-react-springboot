/*
  src/pages/RequestEditPage.jsx // ファイルパスを明示する
  目的: /requests/:id/edit の「申請編集」ページとして、RETURNED の申請だけを編集して保存（PATCH）し、必要なら再提出（submit）できるUIを提供する // 詳細から操作を分離する
  呼び出し元/使用箇所: src/App.jsx の <Route path="/requests/:id/edit" element={<RequestEditPage />} /> から表示される // どこから使われるかを説明する
  入力と出力: 入力=URLの :id（useParams） / 出力=RETURNEDの場合は編集フォーム＋保存＋再提出、RETURNED以外は案内表示 // 入出力を説明する
  依存／前提: react, react-router-dom, @tanstack/react-query, jotai, apiClient, statusLabel // 主要依存を列挙する
  今回変更点: RETURNEDの編集保存と再提出を詳細ページから移し、編集ページへ集約した // 変更点を説明する
*/

import { useState } from "react"; // 取得した詳細をフォームstateへ反映するために useEffect/useState を使う
import { Link, useNavigate, useParams } from "react-router-dom"; // URLパラメータ取得・遷移・リンク表示のために Router API を使う
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"; // 詳細取得と保存/再提出のmutationにTanStack Queryを使う
import { useSetAtom } from "jotai"; // Toast を出すために jotai atom へ書き込む setter を取得する

import { toastAtom } from "../lib/atoms"; // 成功/失敗の通知に使う toastAtom を読み込む
import { apiClient } from "../lib/apiClient"; // baseURL=/api の共通クライアントで API を呼ぶ
import { toStatusLabel } from "../lib/statusLabel"; // ステータス表示を日本語化する変換関数を読み込む

export default function RequestEditPage() { // /requests/:id/edit のページコンポーネントを定義する（effect同期を避けて編集開始で初期化する）
  const params = useParams(); // URLパラメータ（/requests/:id/edit）から値を取得して、どの申請を編集するかを特定する
  const requestId = params.id; // :id の値を requestId として扱い、APIのURL組み立てに使う

  const navigate = useNavigate(); // 保存/再提出後に画面遷移するための関数を取得する
  const queryClient = useQueryClient(); // invalidateQueries を行うために QueryClient を取得する
  const setToast = useSetAtom(toastAtom); // Toast を出すための setter を取得する

  const [title, setTitle] = useState(""); // 編集開始後に使う title 入力値を state で保持する
  const [amount, setAmount] = useState(""); // 編集開始後に使う amount 入力値（文字列）を state で保持する
  const [note, setNote] = useState(""); // 編集開始後に使う note 入力値を state で保持する
  const [isEditStarted, setIsEditStarted] = useState(false); // data→state の初期コピーが完了したかを保持する

  const fetchRequestDetail = async () => { // GET /api/requests/{id} の取得処理を関数に切り出す
    const res = await apiClient.get(`/requests/${requestId}`); // baseURL=/api と合成して GET /api/requests/{id} を実行する
    return res.data; // 画面表示に使うレスポンスボディだけを返す
  }; // fetchRequestDetail の定義を終える

  const { data, isLoading, error } = useQuery({ // 申請詳細データを取得するための useQuery を使う
    queryKey: ["request", requestId], // キャッシュキーに requestId を含めて、IDごとにキャッシュを分ける
    queryFn: fetchRequestDetail, // 先ほど定義した取得関数を使う
    enabled: typeof requestId === "string" && requestId.length > 0, // requestId が空のときは取得しない（無駄なリクエストを防ぐ）
  }); // useQuery の呼び出しを終える

  const ensureEditDraft = () => { // 編集開始時に data から state へ初期値を1回だけコピーする関数を定義する
    if (!data) return; // data が無いなら初期化できないので何もしない
    if (isEditStarted) return; // すでに初期化済みなら上書きしない（入力途中の破壊を防ぐ）
    setTitle(data.title ?? ""); // 取得した title を state へコピーして編集の起点にする
    setAmount(String(data.amount ?? 0)); // 取得した amount を文字列化して state へコピーする
    setNote(data.note ?? ""); // 取得した note を state へコピーして編集の起点にする
    setIsEditStarted(true); // 以後は state を編集内容の正として扱うため編集開始フラグを立てる
  }; // ensureEditDraft の定義を終える

  const canEditReturned = Boolean(data && data.status === "RETURNED"); // RETURNED のときだけ編集を許可する判定を作る

  const saveMutation = useMutation({ // RETURNED の申請を「編集して保存」する mutation を定義する
    mutationFn: async () => { // 保存API（PATCH）を呼ぶ非同期関数を定義する
      ensureEditDraft(); // 保存直前に data→state の初期コピーを確実にする（未編集でも空state送信を防ぐ）
      const titleForSave = isEditStarted ? title : (data?.title ?? ""); // 編集開始後は state、未開始なら data を保存値として扱う
      const amountTextForSave = isEditStarted ? amount : String(data?.amount ?? 0); // 編集開始後は state、未開始なら data を保存値として扱う
      const noteForSave = isEditStarted ? note : (data?.note ?? ""); // 編集開始後は state、未開始なら data を保存値として扱う
      const numericAmount = Number(amountTextForSave); // 金額文字列を数値へ変換してAPIへ送る準備をする
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
    onError: (err) => { // 保存失敗時の処理を定義する
      const status = err?.response?.status ?? null; // AxiosエラーならHTTPステータスを取り出す
      const msg = status ? `HTTP ${status}` : String(err); // 表示用メッセージを最小で組み立てる
      setToast({ open: true, type: "error", message: `保存に失敗しました: ${msg}` }); // 失敗理由をToastで通知する
    }, // onError の定義を終える
  }); // saveMutation の定義を終える

  const resubmitMutation = useMutation({ // 再提出（submit）を実行する mutation を定義する
    mutationFn: async () => { // submit APIを呼ぶ非同期関数を定義する
      ensureEditDraft(); // 再提出直前に data→state の初期コピーを確実にする（未編集でも空state送信を防ぐ）
      const res = await apiClient.post(`/requests/${requestId}/submit`); // POST /api/requests/{id}/submit を呼び出して状態遷移させる
      return res.data; // 成功時レスポンスがあれば返す（使わなくても一旦返す）
    }, // mutationFn の定義を終える
    onSuccess: async () => { // 提出成功後の処理を定義する
      await queryClient.invalidateQueries({ queryKey: ["requests"] }); // 一覧（My Requests）を再取得させるために無効化する
      await queryClient.invalidateQueries({ queryKey: ["request", requestId] }); // 詳細（いま編集している申請）を再取得させるために無効化する
      await queryClient.invalidateQueries({ queryKey: ["inbox"] }); // Inbox（承認者側）に反映させるために無効化する
      setToast({ open: true, type: "success", message: "再提出しました" }); // 成功したことをToastで通知する
      navigate(`/requests/${requestId}`, { replace: true }); // 再提出後は詳細へ戻して閲覧に寄せる
    }, // onSuccess の定義を終える
    onError: (err) => { // 提出失敗時の処理を定義する
      const status = err?.response?.status ?? null; // AxiosエラーならHTTPステータスを取り出す
      const msg = status ? `HTTP ${status}` : String(err); // 表示用メッセージを最小で組み立てる
      setToast({ open: true, type: "error", message: `再提出に失敗しました: ${msg}` }); // 失敗理由をToastで通知する
    }, // onError の定義を終える
  }); // resubmitMutation の定義を終える

  const httpStatus = error?.response?.status ?? null; // エラーがあればHTTPステータスを取り出し、無ければnullにする
  const errorLabel = error ? (httpStatus ? `HTTP ${httpStatus}` : String(error)) : ""; // 表示用のエラーメッセージを1行にまとめる

  return ( // 画面の表示を返す
    <div> {/* 画面のルート要素を定義する */}
      <h1>申請編集</h1> {/* 画面の見出しを表示する */}
      <p>申請ID：{requestId}</p> {/* いま編集対象の申請IDを表示する */}

      {isLoading ? ( // ローディング中の分岐を開始する
        <p>Loading...</p> // ローディング中の表示を行う
      ) : error ? ( // エラー時の分岐を開始する
        <p>エラー：{errorLabel}</p> // エラー要約を表示する
      ) : data ? ( // 成功時（dataが取れた）の分岐を開始する
        <div> {/* 編集ブロックを開始する */}
          <p>状態：{toStatusLabel(data.status)}</p> {/* 現在の状態を表示して、編集可否の判断材料にする */}

          {!canEditReturned ? ( // RETURNED以外のときの分岐を開始する
            <div> {/* 編集不可の案内ブロックを開始する */}
              <p>この申請は差戻し（RETURNED）のときだけ編集できます。</p> {/* 仕様に沿って編集条件を説明する */}
              <p> {/* 戻るリンク行を開始する */}
                <Link to={`/requests/${requestId}`}>詳細に戻る</Link> {/* 詳細へ戻して閲覧に寄せる */}
              </p> {/* 戻るリンク行を閉じる */}
            </div> /* 編集不可の案内ブロックを閉じる */
          ) : ( // RETURNEDのときの分岐を開始する
            <div> {/* 編集フォームブロックを開始する */}
              <div> {/* フォーム行を開始する */}
                <label>件名</label> {/* 入力項目名を表示する */}
                <input value={isEditStarted ? title : (data.title ?? "")} onFocus={() => ensureEditDraft()} onChange={(e) => { ensureEditDraft(); setTitle(e.target.value); }} /> {/* 未編集はdata表示、編集開始でstateへコピーしてからstateを更新する */}
              </div> {/* フォーム行を閉じる */}

              <div> {/* フォーム行を開始する */}
                <label>金額</label> {/* 入力項目名を表示する */}
                <input value={isEditStarted ? amount : String(data.amount ?? 0)} onFocus={() => ensureEditDraft()} onChange={(e) => { ensureEditDraft(); setAmount(e.target.value); }} inputMode="numeric" /> {/* 未編集はdata表示、編集開始でstateへコピーしてからstateを更新する */}
              </div> {/* フォーム行を閉じる */}

              <div> {/* フォーム行を開始する */}
                <label>備考</label> {/* 入力項目名を表示する */}
                <textarea value={isEditStarted ? note : (data.note ?? "")} onFocus={() => ensureEditDraft()} onChange={(e) => { ensureEditDraft(); setNote(e.target.value); }} /> {/* 未編集はdata表示、編集開始でstateへコピーしてからstateを更新する */}
              </div> {/* フォーム行を閉じる */}

              <button type="button" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}> {/* 保存ボタンを定義し、送信中は無効化する */}
                {saveMutation.isPending ? "保存中..." : "保存"} {/* 送信中は表示を変えて二重送信を避ける */}
              </button> {/* 保存ボタンを閉じる */}

              <button type="button" onClick={() => resubmitMutation.mutate()} disabled={resubmitMutation.isPending}> {/* 再提出ボタンを定義し、送信中は無効化する */}
                {resubmitMutation.isPending ? "再提出中..." : "再提出"} {/* 送信中は表示を変えて二重送信を避ける */}
              </button> {/* 再提出ボタンを閉じる */}

              <p> {/* 戻るリンク行を開始する */}
                <Link to={`/requests/${requestId}`}>詳細に戻る</Link> {/* 編集を終えたら詳細へ戻れるようにする */}
              </p> {/* 戻るリンク行を閉じる */}
            </div> /* 編集フォームブロックを閉じる */
          )} {/* RETURNEDかどうかの分岐を閉じる */}
        </div> /* 編集ブロックを閉じる */
      ) : ( // enabled=false 等で data が無い場合の分岐を開始する
        <p>データがありません</p> // 取得できなかった場合の表示を行う
      )}
    </div> /* 画面のルート要素を閉じる */
  ); // return の終了を明示する
} // RequestEditPage の定義を閉じる