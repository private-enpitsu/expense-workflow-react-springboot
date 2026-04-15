/**
 * 申請（ExpenseRequest）のCRUD操作を提供するコントローラクラス。
 * <ul>
 *   <li>GET    /api/requests       : ログインユーザー自身の申請一覧取得</li>
 *   <li>POST   /api/requests       : 申請の新規作成</li>
 *   <li>GET    /api/requests/{id}  : 申請詳細取得（自分の申請のみ）</li>
 *   <li>PATCH  /api/requests/{id}  : 差戻し（RETURNED）申請の内容編集</li>
 *   <li>GET    /api/requests/{id}/history : 申請者向け操作履歴取得</li>
 * </ul>
 * 実処理は {@link com.example.expenseworkflow.store.RequestStore} に委譲する。
 */

package com.example.expenseworkflow.controller.dto;

import java.util.Collections;
import java.util.List;

import jakarta.servlet.http.HttpSession;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.example.expenseworkflow.controller.UpdateRequestRequest;
import com.example.expenseworkflow.store.RequestStore;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class RequestsController {

	private static final String SESSION_KEY_USER_ID = "SESSION_KEY_USER_ID";
	private final RequestStore requestStore; 
	

	@GetMapping("/requests")
	public List<RequestSummaryResponse> listRequests(HttpSession session) {
		Long userId = requireUserId(session);
		return requestStore.listByApplicant(userId);
	}

	// 申請を新規作成して、作成したサマリを返す
	@PostMapping("/requests")
	public RequestSummaryResponse createRequest(HttpSession session, @RequestBody CreateRequestRequest body) {
		String safeTitle = body != null && body.getTitle() != null ? body.getTitle() : "";
		int safeAmount = body != null ? body.getAmount() : 0;
		String safeNote = body != null && body.getNote() != null ? body.getNote() : "";
		return requestStore.create(requireUserId(session), safeTitle, safeAmount, safeNote);
	}

	// URLの{id}を受け取り詳細を返す
	@GetMapping("/requests/{id}")
	public ResponseEntity<RequestDetailResponse> getRequestDetail(HttpSession session, @PathVariable("id") Long id) {

		Long userId = requireUserId(session);

		RequestSummaryResponse found = requestStore.findByIdForApplicant(userId, id);
		if (found == null) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
		}

		RequestDetailResponse detail = new RequestDetailResponse( // 詳細DTOを組み立てる
				found.getId(),
				found.getTitle(),
				found.getAmount(), 
				found.getStatus(),
				found.getNote(),
				Collections.<RequestActionResponse> emptyList(),
				found.getLastReturnComment()
		);

		return ResponseEntity.ok(detail);

	}

	
	// 差戻し（RETURNED）の申請を編集して保存する（表示は次のGETで確認する前提で204を返す）
	@PatchMapping("/requests/{id}")
	public ResponseEntity<Void> updateRequest(HttpSession session, @PathVariable("id") Long id, @RequestBody UpdateRequestRequest body) {

		String safeTitle = body != null && body.getTitle() != null ? body.getTitle() : "";
		int safeAmount = body != null ? body.getAmount() : 0;
		String safeNote = body != null && body.getNote() != null ? body.getNote() : "";

		boolean updated = requestStore.updateReturned(requireUserId(session), id, safeTitle, safeAmount, safeNote);
		if (!updated) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
		}

		return ResponseEntity.noContent().build();

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
		Object userIdObj = session != null ? session.getAttribute(SESSION_KEY_USER_ID) : null;
		if (userIdObj == null) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
		}
		if (userIdObj instanceof Long) {
			return (Long) userIdObj;
		}
		throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
	}

}
