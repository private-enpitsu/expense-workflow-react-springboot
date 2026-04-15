/**
 * 申請（ExpenseRequest）に関するビジネスロジックとDB操作を集約するサービスクラス。
 * Controllerからの呼び出しを受け、{@link com.example.expenseworkflow.mapper.ExpenseRequestMapper} へSQL実行を委譲する。
 * 申請の一覧取得・新規作成・詳細取得・状態遷移（提出/承認/差戻し/取り下げ/却下）・
 * 内容編集・操作履歴取得などのユースケースを提供する。
 * 状態変更を伴う操作はすべて {@code @Transactional} でトランザクション管理する。
 */

package com.example.expenseworkflow.store;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.example.expenseworkflow.controller.dto.InboxItemResponse;
import com.example.expenseworkflow.controller.dto.RequestDetailResponse;
import com.example.expenseworkflow.controller.dto.RequestHistoryItemResponse;
import com.example.expenseworkflow.controller.dto.RequestSummaryResponse;
import com.example.expenseworkflow.domain.ExpenseRequest;
import com.example.expenseworkflow.domain.User;
import com.example.expenseworkflow.mapper.ExpenseRequestMapper;
import com.example.expenseworkflow.mapper.UserMapper;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class RequestStore {
	private final ExpenseRequestMapper expenseRequestMapper;

	private final UserMapper userMapper;
	
	public List<RequestSummaryResponse> list() { // 申請一覧（サマリ）を取得するメソッド。
		return expenseRequestMapper.selectRequestSummaries();
	}

	public List<RequestSummaryResponse> listByApplicant(Long applicantUserId) { // 申請者本人の申請だけを一覧として取得するメソッド。
		return expenseRequestMapper.selectRequestSummariesByApplicant(applicantUserId);
	}

	@Transactional // このメソッド内のDB操作を1トランザクションとして扱う（途中で例外ならロールバックする）。
	public RequestSummaryResponse create(Long applicantUserId, String title, int amount, String note) {
		String status = "DRAFT";

		ExpenseRequest entity = new ExpenseRequest(); // DBにINSERTするためのエンティティ（1申請）を新しく作る。
		entity.setApplicantId(applicantUserId);
		entity.setCurrentApproverId(null);
		entity.setTitle(title);
		entity.setAmount(amount);
		entity.setStatus(status);
		entity.setNote(note);

		expenseRequestMapper.insertExpenseRequest(entity); // INSERTを実行する（MyBatisの設定により、採番されたIDがentityに反映される想定）。

		Long newId = entity.getId();

		return new RequestSummaryResponse(newId, title, amount, status, note, null);
	}

	public RequestSummaryResponse findById(Long id) { // 数値IDから申請のサマリを1件取得する。
		if (id == null) { // 引数がnullなら取得不能。
			return null; // 見つからない扱いとしてnullを返す（Controller側で404等に変換する想定）。
		}

		ExpenseRequest found = expenseRequestMapper.selectExpenseRequestById(id); // 数値IDで申請エンティティを1件取得する。
		if (found == null) {
			return null;
		}

		String note = found.getNote() != null ? found.getNote() : ""; // noteがnullなら空文字にする（レスポンス側でnullを避けたい意図）。

		return new RequestSummaryResponse(found.getId(), found.getTitle(), found.getAmount(), found.getStatus(), note, found.getLastReturnComment()); // lastReturnCommentをエンティティから取り出して渡す。
	}

	public RequestSummaryResponse findByIdForApplicant(Long applicantUserId, Long id) { // 申請者本人の申請だけを数値IDで取得する。
		if (id == null) {
			return null;
		}

		ExpenseRequest found = expenseRequestMapper.selectExpenseRequestByIdAndApplicant(id, applicantUserId); // id と applicant_id の両方で1件取得し、他人の申請は見えないようにする。
		if (found == null) {
			return null;
		}

		String note = found.getNote() != null ? found.getNote() : ""; // noteがnullなら空文字にする（レスポンス側でnullを避けたい意図）。

		return new RequestSummaryResponse(found.getId(), found.getTitle(), found.getAmount(), found.getStatus(), note, found.getLastReturnComment()); // lastReturnCommentをエンティティから取り出して渡す。
	}

	public List<InboxItemResponse> inbox(Long approverUserId) { // 承認者ユーザーIDに紐づくInbox（承認待ち一覧など）を取得する。
		List<InboxItemResponse> items = expenseRequestMapper.selectInboxItems(approverUserId);
		return items != null ? items : new ArrayList<>();
	}

	public RequestDetailResponse findByIdForApprover(Long approverUserId, Long id) { // 承認者本人が担当する申請を詳細取得する。
		if (id == null) {
			return null;
		}
		ExpenseRequest found = expenseRequestMapper.selectExpenseRequestByIdAndApprover(id, approverUserId); // id と current_approver_id の両方で1件取得し、他人のInbox申請は見えないようにする。
		if (found == null) {
			return null;
		}
		String note = found.getNote() != null ? found.getNote() : "";
		return new RequestDetailResponse(
			found.getId(),
			found.getTitle(),
			found.getAmount(),
			found.getStatus(),
			note,
			java.util.Collections.emptyList(), // actionsは現フェーズでは空配列で返す
			found.getLastReturnComment() // lastReturnCommentをエンティティから取り出して渡す
		);
	}

	@Transactional // 状態更新（UPDATE）を行うのでトランザクション境界を張る。
	public boolean submit(Long userId, Long id) { // 申請者が提出する（DRAFT→SUBMITTED）処理。成功ならtrue。
		if (id == null) {
			return false;
		}
		User applicant = userMapper.findById(userId); // submitした本人（申請者）を users から取得して、上長（承認者）の決定に使います。
		if (applicant == null) {
			return false;
		}
		Long approverUserId = applicant.getManagerId(); // 申請者の上長ID（manager_id）を承認者として採用し、current_approver_idにセットするために取り出します。
		if (approverUserId == null) {
			throw new org.springframework.web.server.ResponseStatusException(
				org.springframework.http.HttpStatus.BAD_REQUEST,
				"Cannot submit because your manager_id is NULL (approver is not configured)."
			);
		}
        // 履歴INSERTのためにUPDATE前のstatusを取得する
        ExpenseRequest current = expenseRequestMapper.selectExpenseRequestById(id);
        String fromStatus = current != null ? current.getStatus() : "DRAFT";

        int updated = expenseRequestMapper.updateStatusForApplicant(id, userId, approverUserId, "SUBMITTED");
        if (updated != 1) return false;

        // 提出履歴をINSERTする
        expenseRequestMapper.insertExpenseRequestAction(
            id, userId, "SUBMIT", fromStatus, "SUBMITTED", null);
        return true;
	}

	@Transactional // 状態更新（UPDATE）を行うのでトランザクション境界を張る。
	public boolean approve(Long userId, Long id) {
		if (id == null) {
			return false;
		}
        int updated = expenseRequestMapper.updateStatusForApprover(id, userId, "APPROVED"); // 承認者本人が処理できる申請だけを対象にAPPROVEDへ更新し、更新件数を受け取る。
        if (updated != 1) return false;

        // 承認履歴をINSERTする
        expenseRequestMapper.insertExpenseRequestAction(
            id, userId, "APPROVE", "SUBMITTED", "APPROVED", null);
        return true;
	}

	@Transactional // 状態更新（UPDATE）と履歴INSERTを同一トランザクションにするために境界を張る。
	public boolean returnRequest(Long userId, Long id, String comment) {
		if (id == null) {
			return false;
		}

		ExpenseRequest current = expenseRequestMapper.selectExpenseRequestById(id); // 現在の申請状態を取得し、差戻し可能条件とfrom_status決定に使う。
		if (current == null) {
			return false;
		}

		Long currentApproverId = current.getCurrentApproverId(); // 現在の承認者IDを取り出し、操作権限の判定に使う。
		if (currentApproverId == null || !currentApproverId.equals(userId)) {
			return false;
		}

		String fromStatus = current.getStatus(); // 履歴に残すfrom_statusとして、更新前のstatusを保持する。
		if (fromStatus == null || !"SUBMITTED".equals(fromStatus)) {
			return false;
		}

		String toStatus = "RETURNED"; // 遷移後ステータスをRETURNEDに固定する。
		int updated = expenseRequestMapper.updateStatusForApproverWithComment(id, userId, toStatus, comment);
		if (updated != 1) {
			return false;
		}

		String action = "RETURN"; // actionsテーブルに残す操作名をRETURNに固定する（差戻し操作であることを判別できるようにする）。
		expenseRequestMapper.insertExpenseRequestAction(id, userId, action, fromStatus, toStatus, comment);
		return true;
	}
	
	@Transactional
	public boolean withdraw(Long applicantUserId, Long id) { // 申請者が申請を取り下げる（DRAFT/RETURNED→WITHDRAWN）処理。成功ならtrue。
		if (id == null) return false;
        // 履歴INSERTのためにUPDATE前のstatusを取得する
        ExpenseRequest current = expenseRequestMapper.selectExpenseRequestById(id);
        String fromStatus = current != null ? current.getStatus() : "DRAFT";

        int updated = expenseRequestMapper
                .updateStatusToWithdrawn(id, applicantUserId);
        if (updated != 1) return false;

        // 取り下げ履歴をINSERTする
        expenseRequestMapper.insertExpenseRequestAction(
            id, applicantUserId, "WITHDRAW", fromStatus, "WITHDRAWN", null);
        return true;
	}

	@Transactional
	public boolean reject(Long approverUserId, Long id, String comment) { // 承認者が申請を却下する（SUBMITTED→REJECTED）処理。成功ならtrue。
		if (id == null) return false;
        int updated = expenseRequestMapper
                .updateStatusToRejected(id, approverUserId);
        if (updated != 1) return false;

        // 却下履歴をINSERTする
        expenseRequestMapper.insertExpenseRequestAction(
            id, approverUserId, "REJECT", "SUBMITTED", "REJECTED", comment);
        return true;
	}
	
	@Transactional // 内容更新（UPDATE）を行うのでトランザクション境界を張る。
	public boolean updateReturned(Long applicantUserId, Long id, String title, int amount, String note) {
		if (id == null) {
			return false;
		}
		int updated = expenseRequestMapper.updateEditableFieldsForApplicant(id, applicantUserId, title, amount, note);
		return updated == 1;
	}

    // 申請者本人の申請の操作履歴を取得する
    public List<RequestHistoryItemResponse>
            getHistory(Long applicantUserId, Long requestId) {
        if (requestId == null) return List.of();
        List<RequestHistoryItemResponse> result =
            expenseRequestMapper
                .selectHistoryByRequestIdAndApplicant(
                    requestId, applicantUserId);
        return result != null ? result : List.of();
    }
    
 // 承認者本人が担当する申請の操作履歴を取得する
    public List<RequestHistoryItemResponse>
            getHistoryForApprover(Long approverUserId, Long requestId) {
        if (requestId == null) return List.of();
        List<RequestHistoryItemResponse> result =
            expenseRequestMapper
                .selectHistoryByRequestIdAndApprover(
                    requestId, approverUserId);
        return result != null ? result : List.of();
    }

}
