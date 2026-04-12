/**
 * GET /api/inbox のレスポンスとして、承認待ち一覧の1行を表すDTOクラス。
 * 承認者のInbox一覧画面で必要な最小情報（id・件名・金額・ステータス）を保持する。
 */

package com.example.expenseworkflow.controller.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InboxItemResponse {
	
	private Long id;
	private String title; // 件名を返すフィールドを保持する
	private int amount; // 金額を返すフィールドを保持する
	private String status; // 状態（例：SUBMITTED）を返すフィールドを保持する

}
