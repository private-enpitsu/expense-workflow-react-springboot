/**
 * ワークフロー（状態遷移・承認者Inbox）系のHTTPエンドポイントを提供するコントローラクラス。
 * <ul>
 *   <li>GET  /api/inbox           : 承認者のInbox一覧取得</li>
 *   <li>GET  /api/inbox/{id}      : 承認者の申請詳細取得</li>
 *   <li>GET  /api/inbox/{id}/history : 承認者向け操作履歴取得</li>
 *   <li>POST /api/requests/{id}/submit   : 申請提出（DRAFT→SUBMITTED）</li>
 *   <li>POST /api/requests/{id}/approve  : 承認（SUBMITTED→APPROVED）</li>
 *   <li>POST /api/requests/{id}/return   : 差戻し（SUBMITTED→RETURNED）</li>
 *   <li>POST /api/requests/{id}/withdraw : 取り下げ（DRAFT/RETURNED→WITHDRAWN）</li>
 *   <li>POST /api/requests/{id}/reject   : 却下（SUBMITTED→REJECTED）</li>
 * </ul>
 * 実処理は {@link com.example.expenseworkflow.store.RequestStore} に委譲する。
 */

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
import com.example.expenseworkflow.controller.dto.RequestDetailResponse;
import com.example.expenseworkflow.controller.dto.RequestHistoryItemResponse;
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
	public ResponseEntity<List<InboxItemResponse>> inbox(HttpSession session) {
		Long userId = requireUserId(session);
		List<InboxItemResponse> items = requestStore.inbox(userId);
		return ResponseEntity.ok(items);
	}

	// 承認者が自分のInbox申請を詳細取得する（GET /api/inbox/{id}）
	@GetMapping("/inbox/{id}")
	public ResponseEntity<RequestDetailResponse> inboxDetail(HttpSession session, @PathVariable("id") Long id) {
		Long userId = requireUserId(session); // 未ログインなら401にする
		RequestDetailResponse detail = requestStore.findByIdForApprover(userId, id);
		if (detail == null) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
		}
		return ResponseEntity.ok(detail);
	}

	// 申請を提出してDRAFT→SUBMITTEDへ遷移させる
	@PostMapping("/requests/{id}/submit")
	public ResponseEntity<Void> submit(HttpSession session, @PathVariable("id") Long id) {
		Long userId = requireUserId(session);
		boolean ok = requestStore.submit(userId, id);
		if (!ok) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
		}
		return ResponseEntity.ok().build();
	}

	// 申請を承認してSUBMITTED→APPROVEDへ遷移させる
	@PostMapping("/requests/{id}/approve")
	public ResponseEntity<Void> approve(HttpSession session, @PathVariable("id") Long id) {
		Long userId = requireUserId(session);
		boolean ok = requestStore.approve(userId, id);
		if (!ok) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
		}
		return ResponseEntity.ok().build();
	}

	// 申請を差戻してSUBMITTED→RETURNEDへ遷移させる
	@PostMapping("/requests/{id}/return")
	public ResponseEntity<Void> returnRequest(
			HttpSession session,
			@PathVariable("id") Long id,
			@org.springframework.web.bind.annotation.RequestBody com.example.expenseworkflow.controller.dto.ReturnRequestRequest body
	) { // メソッド定義を開始する
		Long userId = requireUserId(session);
		String comment = body != null ? body.getComment() : null;
		boolean ok = requestStore.returnRequest(userId, id, comment);
		if (!ok) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
		} // 失敗時分岐を閉じる
		return ResponseEntity.ok().build();
	}
	
	// 申請者が申請を取り下げる（DRAFT/RETURNED→WITHDRAWN）
	@PostMapping("/requests/{id}/withdraw")
	public ResponseEntity<Void> withdraw(
			HttpSession session,
			@PathVariable("id") Long id) {
		Long userId = requireUserId(session);
		boolean ok = requestStore.withdraw(userId, id);
		if (!ok) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
		}
		return ResponseEntity.ok().build();
	}

	// 承認者が申請を却下する（SUBMITTED→REJECTED）
	@PostMapping("/requests/{id}/reject")
	public ResponseEntity<Void> reject(
			HttpSession session,
			@PathVariable("id") Long id,
			@org.springframework.web.bind.annotation.RequestBody
			com.example.expenseworkflow.controller.dto.ReturnRequestRequest body) {
		Long userId = requireUserId(session);
		boolean ok = requestStore.reject(userId, id, body.getComment());
		if (!ok) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
		}
		return ResponseEntity.ok().build();
	}
	
    // 承認者本人が担当する申請の操作履歴を返す
    @GetMapping("/inbox/{id}/history")
    public ResponseEntity<List<RequestHistoryItemResponse>>
            getInboxHistory(
                HttpSession session,
                @PathVariable("id") Long id) {
        Long userId = requireUserId(session);
        List<RequestHistoryItemResponse> history =
            requestStore.getHistoryForApprover(userId, id);
        return ResponseEntity.ok(history);
    }

	 // セッションからユーザーIDを「必須で」取り出す共通処理。取れない/不正なら401にします。
	private Long requireUserId(HttpSession session) {
		Object userIdObj = session != null ? session.getAttribute(SESSION_KEY_USER_ID) : null;
		if (userIdObj == null) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
		}
		if (userIdObj instanceof Long) {
			return (Long) userIdObj;
		}
		throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
	}

} //WorkflowController
