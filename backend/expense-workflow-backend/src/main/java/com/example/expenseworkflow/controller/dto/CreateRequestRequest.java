// /api/requests の POST 入力（title/amount/note）を受け取るDTOを提供する

package com.example.expenseworkflow.controller.dto;

import lombok.Data;


@Data
public class CreateRequestRequest {
	private String title; // 申請の件名を受け取るフィールドを定義する
	private int amount; // 申請の金額を受け取るフィールドを定義する
	private String note; // 申請の備考を受け取るフィールドを定義する
}
