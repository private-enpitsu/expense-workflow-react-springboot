package com.example.expenseworkflow.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.expenseworkflow.controller.dto.InboxItemResponse;
import com.example.expenseworkflow.controller.dto.RequestSummaryResponse;
import com.example.expenseworkflow.domain.ExpenseRequest;

@Mapper
public interface ExpenseRequestMapper { // MyBatisが実装を生成するための「申請テーブル操作用Mapperインターフェース」を定義する

	List<RequestSummaryResponse> selectRequestSummaries(); // 申請一覧画面向けに、サマリDTO（id/title/amount/status/note等）のリストをDBから取得する

	ExpenseRequest selectExpenseRequestById(@Param("id") Long id); // 申請テーブルの主キーidで1件取得し、ドメイン（ExpenseRequest）として返す

	int insertExpenseRequest(ExpenseRequest entity); // ExpenseRequestの内容を expense_requests にINSERTし、挿入件数（通常1）を返す

	List<InboxItemResponse> selectInboxItems(@Param("approverUserId") Long approverUserId); // 承認者のInbox向けに、該当ユーザーの受信箱アイテムDTO一覧をDBから取得する

	int updateStatusForApplicant( // 申請者の提出操作として、申請者本人の申請だけを対象に状態更新するためのメソッド宣言です。
			@Param("id") Long id, // 更新対象の申請ID（expense_requests.id）を指定して、どの申請を更新するかを決めます。
			@Param("applicantUserId") Long applicantUserId, // 申請者本人のユーザーIDを指定し、他人の申請を更新できないようにする条件に使います。
			@Param("approverUserId") Long approverUserId, // submit時に決定した承認者ユーザーIDを受け取り、current_approver_idへセットするために使います。
			@Param("toStatus") String toStatus // 遷移後ステータス（ここではSUBMITTED）を受け取り、statusへセットするために使います。
		); // 更新件数（0または1）を返し、1なら更新成功として扱います。
	
	int updateStatusForApprover(@Param("id") Long id, @Param("approverUserId") Long approverUserId, // 承認者の操作として、指定idの申請を「承認者ID一致」の条件つきで更新するために必要な引数を受け取る
								@Param("toStatus") String toStatus); // 更新後ステータス（例：APPROVED/RETURNED）を受け取り、更新件数（0または1）を返す
}
