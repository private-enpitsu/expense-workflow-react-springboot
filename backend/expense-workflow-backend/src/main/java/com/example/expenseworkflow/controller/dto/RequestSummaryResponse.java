// /api/requests の GET/POST の返却で使う「申請サマリ」を表すDTOを提供する

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
