/**
 * expense_requestsテーブルの1レコードを表すドメインクラス（エンティティ）。
 * 申請者ID・承認者ID・件名・金額・ステータス・日付・差戻しコメントなど、
 * 申請に関するすべての属性を保持する。MyBatisのMapperによりDBと対応付けられる。
 */

package com.example.expenseworkflow.domain;

import java.time.LocalDate;
import java.time.LocalDateTime;

import lombok.Data;

@Data
public class ExpenseRequest {
	private Long id;
	private Long applicantId;
	private Long currentApproverId;
	private String title;
	private LocalDate expenseDate;
	private LocalDate applyDate;
	private Integer amount;
	private String purpose;
	private String paymentMethod;
	private String status;
	private LocalDateTime submittedAt;
	private LocalDateTime approvedAt;
	private LocalDateTime lastReturnedAt;
	private String lastReturnComment;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;
	private String note;

}
