// このファイルは、申請のCRUD（一覧/作成/詳細）だけを提供するために存在します。 // 目的を自然文で説明する
// このAPIは、フロントの RequestsListPage と RequestCreatePage と RequestDetailPage が /api/requests を通じて呼び出します。 // 呼び出し元を自然文で説明する
// 入力は、POST時のJSON（title/amount/note）と、詳細取得時のURL{id}です。出力は、申請サマリの配列または詳細のJSONです。 // 入出力を自然文で説明する
// 依存は、Spring Web と Jackson と、メモリ保存SOTの InMemoryRequestStore です（DBは使いません）。 // 依存と前提を自然文で説明する
// 今回変更点: getRequestDetail で lastReturnComment を RequestDetailResponse へ渡すようにした // 今回変更点を自然文で説明する

package com.example.expenseworkflow.controller.dto;

import java.util.Collections; // 読み取り専用ビューを返すためにCollectionsを使うので読み込む
import java.util.List; // 返却型としてListを使うので読み込む

import jakarta.servlet.http.HttpSession;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping; // GETのエンドポイントを定義するために読み込む
import org.springframework.web.bind.annotation.PatchMapping; // PATCHのエンドポイントを定義するために読み込む
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping; // POSTのエンドポイントを定義するために読み込む
import org.springframework.web.bind.annotation.RequestBody; // JSONボディを引数に受け取るために読み込む
import org.springframework.web.bind.annotation.RequestMapping; // コントローラ全体のパス接頭辞を付けるために読み込む
import org.springframework.web.bind.annotation.RestController; // RESTコントローラとして登録するために読み込む
import org.springframework.web.server.ResponseStatusException;

import com.example.expenseworkflow.controller.UpdateRequestRequest;
import com.example.expenseworkflow.store.RequestStore;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class RequestsController {

	private static final String SESSION_KEY_USER_ID = "SESSION_KEY_USER_ID"; // AuthController と同じキーでユーザーIDを読む
	private final RequestStore requestStore; // DB実装の保存SOTをDIで受け取る
	

	@GetMapping("/requests") // GET /api/requests を受け付けるためのマッピングを定義する
	public List<RequestSummaryResponse> listRequests(HttpSession session) { // 申請一覧を返す（自分の申請だけに絞る）
		Long userId = requireUserId(session); // セッションのユーザーIDをSOTとして取得し、絞り込み条件に使う
		return requestStore.listByApplicant(userId); // applicant_id で絞った一覧だけ返して、他人の申請が見えないようにする
	}

	// 申請を新規作成して、作成したサマリを返す
	@PostMapping("/requests")
	public RequestSummaryResponse createRequest(HttpSession session, @RequestBody CreateRequestRequest body) { // 申請を新規作成してサマリを返す
		String safeTitle = body != null && body.getTitle() != null ? body.getTitle() : ""; // title が null でも落ちないように空文字へ寄せる
		int safeAmount = body != null ? body.getAmount() : 0; // amount が無い場合は 0 として扱う
		String safeNote = body != null && body.getNote() != null ? body.getNote() : ""; // note が null でも落ちないように空文字へ寄せる
		return requestStore.create(requireUserId(session), safeTitle, safeAmount, safeNote); // 申請者IDはセッションから取得してDBへ保存する
	}

	// URLの{id}を受け取り詳細を返す
	@GetMapping("/requests/{id}") // GET /api/requests/{id} を受け付けるためのマッピングを定義する
	public ResponseEntity<RequestDetailResponse> getRequestDetail(HttpSession session, @PathVariable("id") Long id) { // URLの{id}を受け取り詳細を返す（自分の申請だけ）

		Long userId = requireUserId(session); // セッションのユーザーIDをSOTとして取得し、他人の申請が見えないようにする

		RequestSummaryResponse found = requestStore.findByIdForApplicant(userId, id); // id と applicant_id で一致する申請だけ取得する
		if (found == null) { // 見つからない場合（存在しない or 他人の申請）の分岐をする
			return ResponseEntity.status(HttpStatus.NOT_FOUND).build(); // 詳細を見せないため404として返す
		}

		RequestDetailResponse detail = new RequestDetailResponse( // 詳細DTOを組み立てる
				found.getId(), // 外部ID（REQ-xxx）をそのまま返す
				found.getTitle(), // タイトルを返す
				found.getAmount(), // 金額を返す
				found.getStatus(), // ステータスを返す
				found.getNote(), // note を返す
				Collections.<RequestActionResponse> emptyList(), // Phase1は actions を空配列として返す
				found.getLastReturnComment() // 差戻しコメントをそのまま渡す（差戻しなしの場合はnull）
		);

		return ResponseEntity.ok(detail); // 200で詳細DTOを返す

	} // getRequestDetail

	
	// 差戻し（RETURNED）の申請を編集して保存する（表示は次のGETで確認する前提で204を返す） // 何をするメソッドかを説明する
	@PatchMapping("/requests/{id}") // /api/requests/{id} をPATCHで受け、既存申請の内容更新を行う
	public ResponseEntity<Void> updateRequest(HttpSession session, @PathVariable("id") Long id, @RequestBody UpdateRequestRequest body) { // 差戻し申請の編集保存を行う

		String safeTitle = body != null && body.getTitle() != null ? body.getTitle() : ""; // title が null でも落ちないように空文字へ寄せる
		int safeAmount = body != null ? body.getAmount() : 0; // amount が無い場合は 0 として扱う
		String safeNote = body != null && body.getNote() != null ? body.getNote() : ""; // note が null でも落ちないように空文字へ寄せる

		boolean updated = requestStore.updateReturned(requireUserId(session), id, safeTitle, safeAmount, safeNote); // 申請者本人かつRETURNEDの申請だけ更新する
		if (!updated) { // 更新できなかった場合の分岐をする（対象なし/権限違い/状態違い/形式不正など）
			return ResponseEntity.status(HttpStatus.NOT_FOUND).build(); // 既存APIと同様に「できなかった」を404で表現する
		}

		return ResponseEntity.noContent().build(); // 更新成功として204を返し、表示はGET /api/requests/{id} で再取得する

	}
	
	
    // 申請者本人の申請の操作履歴を返す
    @GetMapping("/requests/{id}/history")
    public ResponseEntity<List<RequestHistoryItemResponse>>
            getRequestHistory(
                HttpSession session,
                @PathVariable("id") Long id) {
        Long userId = requireUserId(session);
        List<RequestHistoryItemResponse> history =
            requestStore.getHistory(userId, id);
        return ResponseEntity.ok(history);
    }
	
	private Long requireUserId(HttpSession session) { // 未ログインで申請作成できないようにユーザーIDを必須化する
		Object userIdObj = session != null ? session.getAttribute(SESSION_KEY_USER_ID) : null; // セッションから userId を取り出す
		if (userIdObj == null) { // セッションに userId が無い場合の分岐をする
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED); // 未ログインとして401を返す
		}
		if (userIdObj instanceof Long) { // 型が想定どおり Long の場合の分岐をする
			return (Long) userIdObj; // Long として userId を返す
		}
		throw new ResponseStatusException(HttpStatus.UNAUTHORIZED); // 型が想定外なら未ログイン扱いで401を返す
	}

} //RequestsController
