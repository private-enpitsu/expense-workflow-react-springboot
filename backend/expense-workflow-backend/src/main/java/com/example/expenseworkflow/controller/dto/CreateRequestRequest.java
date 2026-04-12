/**
 * POST /api/requests の入力値を受け取るリクエストDTOクラス。
 * 申請の新規作成時に、件名・金額・備考をリクエストボディから受け取る。
 */

package com.example.expenseworkflow.controller.dto;

import lombok.Data;


@Data
public class CreateRequestRequest {
	private String title; // 申請の件名を受け取るフィールドを定義する
	private int amount; // 申請の金額を受け取るフィールドを定義する
	private String note; // 申請の備考を受け取るフィールドを定義する
}
