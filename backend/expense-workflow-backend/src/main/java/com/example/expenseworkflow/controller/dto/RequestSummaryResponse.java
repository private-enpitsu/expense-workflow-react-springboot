/**
 * GET /api/requests・POST /api/requests のレスポンスとして、申請のサマリ情報を返すDTOクラス。
 * 一覧表示や作成直後の確認に必要な情報（id・件名・金額・ステータス・備考・差戻しコメント）を保持する。
 */


package com.example.expenseworkflow.controller.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// 申請サマリを表す返却DTOクラスを定義する
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RequestSummaryResponse {
	private Long  id; // 申請ID（例：REQ-001）を返すフィールドを定義する
	private String title; // 件名を返すフィールドを定義する
	private int amount; // 金額を返すフィールドを定義する
	private String status; // 状態（例：DRAFT）を返すフィールドを定義する
	private String note; // 備考を返すフィールドを定義する
	private String lastReturnComment; // 最新の差戻しコメントを返すフィールドを定義する（差戻しなしの場合はnull）
}
