// このファイルは、申請のCRUD（一覧/作成/詳細）だけを提供するために存在します。 // 目的を自然文で説明する
// このAPIは、フロントの RequestsListPage と RequestCreatePage と RequestDetailPage が /api/requests を通じて呼び出します。 // 呼び出し元を自然文で説明する
// 入力は、POST時のJSON（title/amount/note）と、詳細取得時のURL{id}です。出力は、申請サマリの配列または詳細のJSONです。 // 入出力を自然文で説明する
// 依存は、Spring Web と Jackson と、メモリ保存SOTの InMemoryRequestStore です（DBは使いません）。 // 依存と前提を自然文で説明する
// 今回は STORE/SEQ/初期データをInMemoryRequestStoreへ移し、WorkflowControllerと共有して二重定義を防ぎます。 // 今回変更点を自然文で説明する

package com.example.expenseworkflow.controller;

import java.util.Collections; // 読み取り専用ビューを返すためにCollectionsを使うので読み込む
import java.util.List; // 返却型としてListを使うので読み込む

import jakarta.servlet.http.HttpSession;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping; // GETのエンドポイントを定義するために読み込む
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping; // POSTのエンドポイントを定義するために読み込む
import org.springframework.web.bind.annotation.RequestBody; // JSONボディを引数に受け取るために読み込む
import org.springframework.web.bind.annotation.RequestMapping; // コントローラ全体のパス接頭辞を付けるために読み込む
import org.springframework.web.bind.annotation.RestController; // RESTコントローラとして登録するために読み込む
import org.springframework.web.server.ResponseStatusException;

import com.example.expenseworkflow.controller.dto.CreateRequestRequest;
import com.example.expenseworkflow.controller.dto.RequestActionResponse;
import com.example.expenseworkflow.controller.dto.RequestDetailResponse;
import com.example.expenseworkflow.controller.dto.RequestSummaryResponse;
import com.example.expenseworkflow.store.RequestStore;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class RequestsController {

	private static final String SESSION_KEY_USER_ID = "SESSION_KEY_USER_ID"; // AuthController と同じキーでユーザーIDを読む
	private final RequestStore requestStore; // DB実装の保存SOTをDIで受け取る

	@GetMapping("/requests")
	public List<RequestSummaryResponse> listRequests() { // 申請一覧を返すエンドポイントを定義する
		return requestStore.list(); // DBの保存SOTから一覧を返して、Controller内に保存二重定義を作らない
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
	@GetMapping("/requests/{id}")
	public ResponseEntity<RequestDetailResponse> getRequestDetail(@PathVariable("id") String id) { // URLの{id}を受け取り詳細を返す

		RequestSummaryResponse found = requestStore.findById(id); // 保存SOT（DB）からid一致の申請サマリを探す
		if (found == null) { // 見つからない場合の分岐をする
			return ResponseEntity.status(HttpStatus.NOT_FOUND).build(); // 存在しないため404を返す
		}

		RequestDetailResponse detail = new RequestDetailResponse( // 詳細DTOを組み立てる
				found.getId(), // 外部ID（REQ-xxx）をそのまま返す
				found.getTitle(), // タイトルを返す
				found.getAmount(), // 金額を返す
				found.getStatus(), // ステータスを返す
				found.getNote(), // note を返す
				Collections.<RequestActionResponse> emptyList() // Phase1は actions を空配列として返す
		);

		return ResponseEntity.ok(detail); // 200で詳細DTOを返す

	} // getRequestDetail

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
