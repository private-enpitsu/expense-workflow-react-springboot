/**
 * expense_requests・expense_request_actionsテーブルへのアクセスを担うMyBatis Mapperインターフェース。
 * SQLはresources/mapper/ExpenseRequestMapper.xmlに定義し、このインターフェースにマッピングする。
 * 申請の一覧取得・詳細取得・INSERT・ステータス更新・履歴INSERT・操作履歴取得などの操作を提供する。
 */

package com.example.expenseworkflow.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.expenseworkflow.controller.dto.InboxItemResponse;
import com.example.expenseworkflow.controller.dto.RequestHistoryItemResponse;
import com.example.expenseworkflow.controller.dto.RequestSummaryResponse;
import com.example.expenseworkflow.domain.ExpenseRequest;

@Mapper
public interface ExpenseRequestMapper { // MyBatisが実装を生成するための「申請テーブル操作用Mapperインターフェース」を定義する

	List<RequestSummaryResponse> selectRequestSummaries();

	List<RequestSummaryResponse> selectRequestSummariesByApplicant(@Param("applicantUserId") Long applicantUserId);

	ExpenseRequest selectExpenseRequestById(@Param("id") Long id);

	ExpenseRequest selectExpenseRequestByIdAndApplicant(@Param("id") Long id, @Param("applicantUserId") Long applicantUserId);
	
	int insertExpenseRequest(ExpenseRequest entity);

	List<InboxItemResponse> selectInboxItems(@Param("approverUserId") Long approverUserId);

	ExpenseRequest selectExpenseRequestByIdAndApprover(@Param("id") Long id, @Param("approverUserId") Long approverUserId);

	int updateStatusForApplicant( // 申請者の提出操作として、申請者本人の申請だけを対象に状態更新するためのメソッド宣言です。
			@Param("id") Long id,
			@Param("applicantUserId") Long applicantUserId,
			@Param("approverUserId") Long approverUserId,
			@Param("toStatus") String toStatus
		);
	
	int updateStatusForApprover( // 承認者が承認/差戻しを実行するための状態更新メソッドを宣言する
			@Param("id") Long id,
			@Param("approverUserId") Long approverUserId,
			@Param("toStatus") String toStatus
	);

	int updateStatusForApproverWithComment( // 差戻し専用：statusをRETURNEDに更新しつつlast_return_commentとlast_returned_atも同時に書き込むメソッドを宣言する
			@Param("id") Long id,
			@Param("approverUserId") Long approverUserId,
			@Param("toStatus") String toStatus,
			@Param("comment") String comment
	);

	int insertExpenseRequestAction( // 差戻しなどの操作履歴を expense_request_actions に1行INSERTするためのメソッドを宣言する
			@Param("requestId") Long requestId,
			@Param("actorId") Long actorId,
			@Param("action") String action,
			@Param("fromStatus") String fromStatus,
			@Param("toStatus") String toStatus,
			@Param("comment") String comment
	);
	
	int updateEditableFieldsForApplicant( // 申請者が差戻し（RETURNED）申請を編集保存するための内容更新メソッドを宣言する
			@Param("id") Long id,
			@Param("applicantUserId") Long applicantUserId,
			@Param("title") String title,
			@Param("amount") int amount,
			@Param("note") String note
	);
	
	int updateStatusToWithdrawn( // 申請者が申請を取り下げる（DRAFT/RETURNED→WITHDRAWN）ためのメソッドを宣言する
			@Param("id") Long id,
			@Param("applicantUserId") Long applicantUserId
	);

	int updateStatusToRejected( // 承認者が申請を却下する（SUBMITTED→REJECTED）ためのメソッドを宣言する
			@Param("id") Long id,
			@Param("approverUserId") Long approverUserId
	);
	
    // 申請者本人の申請の操作履歴を古い順に取得する
    List<RequestHistoryItemResponse>
        selectHistoryByRequestIdAndApplicant(
            @Param("requestId") Long requestId,
            @Param("applicantUserId") Long applicantUserId
    );
    
    // 承認者本人が担当する申請の操作履歴を古い順に取得する
    List<RequestHistoryItemResponse>
        selectHistoryByRequestIdAndApprover(
            @Param("requestId") Long requestId,
            @Param("approverUserId") Long approverUserId
    );
    
}
