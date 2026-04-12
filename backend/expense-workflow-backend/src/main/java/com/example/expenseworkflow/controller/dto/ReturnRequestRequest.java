/**
 * 差戻し（POST /api/requests/{id}/return）・却下操作の入力値を受け取るリクエストDTOクラス。
 * 承認者が差戻し理由として入力したコメント文字列を保持する。
 */

package com.example.expenseworkflow.controller.dto;

import lombok.Data;

// 差戻しコメントを受け取るためのDTOクラスを定義する
@Data
public class ReturnRequestRequest {
	private String comment; // 差戻し理由などのコメント文字列を受け取るフィールドを定義する
}