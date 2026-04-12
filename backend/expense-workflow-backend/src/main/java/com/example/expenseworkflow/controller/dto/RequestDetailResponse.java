/**
 * GET /api/requests/{id}・GET /api/inbox/{id} のレスポンスとして、申請の詳細情報を返すDTOクラス。
 * 申請の基本情報（id・件名・金額・ステータス・備考）に加えて、操作履歴（actions）と差戻しコメントを保持する。
 */

package com.example.expenseworkflow.controller.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;

// 申請詳細レスポンスDTOクラスを定義する
@Getter
@AllArgsConstructor
public class RequestDetailResponse {
	private Long id; // 申請ID（例：REQ-001）を返すフィールドを保持する
	private String title; // 件名を返すフィールドを保持する
	private int amount; // 金額を返すフィールドを保持する
	private String status; // ステータス（例：DRAFT/SUBMITTED/APPROVED）を返すフィールドを保持する
	private String note; // 備考を返すフィールドを保持する
	private List<RequestActionResponse> actions; // 履歴actionsを配列で返すフィールドを保持する
	private String lastReturnComment; // 最新の差戻しコメントを返すフィールドを保持する（差戻しなしの場合はnull）
}
