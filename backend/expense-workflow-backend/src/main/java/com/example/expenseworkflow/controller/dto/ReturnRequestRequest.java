// 差戻し（RETURNED）操作の入力として、コメント文字列を受け取るDTOを提供する

package com.example.expenseworkflow.controller.dto;

import lombok.Data;

// 差戻しコメントを受け取るためのDTOクラスを定義する
@Data
public class ReturnRequestRequest {
	private String comment; // 差戻し理由などのコメント文字列を受け取るフィールドを定義する
}