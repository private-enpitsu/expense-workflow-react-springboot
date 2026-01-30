package com.example.expenseworkflow.dto;

import jakarta.validation.constraints.NotBlank;

import lombok.Data;

@Data //セッターなど
public class LoginRequest { // ログインAPIのリクエストボディを受け取るDTO
	
	@NotBlank
	private String email; // ログインID（設計書：メール）
	
	@NotBlank
	private String password; // 平文パスワード（照合に使う）

}
