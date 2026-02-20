// このファイルは、状態遷移とInbox（承認者の受信箱）を担当する WorkflowController を提供するために存在します。 // 目的を自然文で説明する
// このControllerは、フロントのInbox画面が GET /api/inbox を呼ぶときの入口として利用されます。 // 呼び出し元/使用箇所を自然文で説明する
// 入力はHTTPリクエストで、出力は InboxItemResponse の配列（今回はダミー2件）です。 // 入力と出力を自然文で説明する
// 依存は Spring Web（RestController等）と、DTOをJSONに変換するJackson（Spring標準）です。 // 依存関係を自然文で説明する
// 今回は /api/inbox が空配列ではなくダミー2件を返すようにして、一覧APIの形を先に確定します。 // 今回変更点を自然文で説明する

package com.example.expenseworkflow.controller;

import java.util.List;

import jakarta.servlet.http.HttpSession;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.example.expenseworkflow.controller.dto.InboxItemResponse;
import com.example.expenseworkflow.store.RequestStore;

import lombok.RequiredArgsConstructor;


// Spring MVCのコントローラクラス。ワークフロー（状態遷移・Inbox）系のHTTPエンドポイントをまとめる入れ物です。
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class WorkflowController {
	
	private static final String SESSION_KEY_USER_ID = "SESSION_KEY_USER_ID"; // セッションからログインユーザーIDを取り出すときに使う「キー文字列」を定数化しています（打ち間違い防止）。

	private final RequestStore requestStore; // 申請の検索や状態遷移（submit/approve/return）を行う依存先。ここに実処理を委譲します。

	
	 // GET /inbox をこのメソッドに割り当てます（受信箱＝承認待ち等の一覧を返す想定）。
	@GetMapping("/inbox")
	public ResponseEntity<List<InboxItemResponse>> inbox(HttpSession session) { // HTTPレスポンスとしてInboxItemResponseのリストを返す。HttpSessionはサーバ側セッション（ログイン判定に使う）。
		Long userId = requireUserId(session); // セッションからユーザーIDを必須取得。未ログイン/不正なら例外で401にします。
		List<InboxItemResponse> items = requestStore.inbox(userId); // 指定ユーザーのInbox一覧をRequestStoreから取得します（DBやメモリ等はRequestStore側の責務）。
		return ResponseEntity.ok(items); // HTTP 200でJSON（items）を返します。
	}

	// 申請を提出してDRAFT→SUBMITTEDへ遷移させる
	@PostMapping("/requests/{id}/submit") // POST /requests/{id}/submit をこのメソッドに割り当てます（{id}はパス変数）。
	public ResponseEntity<Void> submit(HttpSession session, @PathVariable("id") String id) { // 戻りはボディなし（Void）。成功/失敗はHTTPステータスで表す設計です。idはURLの {id} を文字列で受け取ります。
		Long userId = requireUserId(session); // セッションからユーザーIDを必須取得（未ログインなら401）。
		boolean ok = requestStore.submit(userId, id); // 申請を「提出」する処理を委譲。成功したらtrue、対象がない/権限なし等ならfalseにする想定。
		if (!ok) { // submitが失敗（false）だった場合の分岐です。
			return ResponseEntity.status(HttpStatus.NOT_FOUND).build(); // 404 Not Found（ボディなし）を返します（対象申請が存在しない、などの表現）。
		}
		return ResponseEntity.ok().build(); // 成功時は200 OK（ボディなし）を返します。
	}

	// 申請を承認してSUBMITTED→APPROVEDへ遷移させる
	@PostMapping("/requests/{id}/approve")
	public ResponseEntity<Void> approve(HttpSession session, @PathVariable("id") String id) {
		Long userId = requireUserId(session);
		boolean ok = requestStore.approve(userId, id);
		if (!ok) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
		}
		return ResponseEntity.ok().build();
	}

	// 申請を差戻してSUBMITTED→RETURNEDへ遷移させる
	@PostMapping("/requests/{id}/return") // 差戻し操作のURLをこのメソッドに割り当てる
	public ResponseEntity<Void> returnRequest( // 差戻しのHTTPエンドポイントを定義する
			HttpSession session, // セッションからログインユーザーIDを取得するために受け取る
			@PathVariable("id") String id, // パス変数の申請ID（REQ-xxx形式）を受け取る
			@org.springframework.web.bind.annotation.RequestBody com.example.expenseworkflow.controller.dto.ReturnRequestRequest body // JSONボディからコメントを受け取る
	) { // メソッド定義を開始する
		Long userId = requireUserId(session); // セッションからユーザーIDを必須取得し、未ログインなら401にする
		String comment = body != null ? body.getComment() : null; // ボディが無い場合でもNPEにならないようにコメントを取り出す
		boolean ok = requestStore.returnRequest(userId, id, comment); // 差戻し（状態更新＋履歴INSERT）をStoreへ委譲する
		if (!ok) { // 差戻しが失敗した場合の分岐をする
			return ResponseEntity.status(HttpStatus.NOT_FOUND).build(); // 対象が無い/権限や状態が合わない場合は404相当で隠す
		} // 失敗時分岐を閉じる
		return ResponseEntity.ok().build(); // 成功時は200 OK（ボディなし）を返す
	} // returnRequest を閉じる

	 // セッションからユーザーIDを「必須で」取り出す共通処理。取れない/不正なら401にします。
	private Long requireUserId(HttpSession session) {
		Object userIdObj = session != null ? session.getAttribute(SESSION_KEY_USER_ID) : null; // sessionがnullでないならキーで属性を取得。nullならuserIdObjもnullにします（NPE回避）。
		if (userIdObj == null) { // セッションにユーザーIDが入っていない＝未ログイン等の扱い。
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED); // 401 Unauthorizedを例外で発生させ、SpringにHTTP化させます。
		}
		if (userIdObj instanceof Long) { // 取り出した値の型がLongであることを確認します（想定通りの型かチェック）。
			return (Long) userIdObj; // Longにキャストして呼び出し元へ返します。
		}
		throw new ResponseStatusException(HttpStatus.UNAUTHORIZED); // 型が想定外（String等）なら不正状態として401にします（安全側に倒す）。
	}

} //WorkflowController
