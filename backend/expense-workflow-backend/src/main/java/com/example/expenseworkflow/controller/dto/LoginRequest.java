/**
 * POST /api/auth/login の入力値を受け取るリクエストDTOクラス。
 * email と password をリクエストボディから受け取り、{@link com.example.expenseworkflow.controller.AuthController} で使用する。
 */

package com.example.expenseworkflow.controller.dto;

import jakarta.validation.constraints.NotBlank;

import lombok.Data;

// ログイン入力を受け取るDTOクラス
@Data
public class LoginRequest {
	
	@NotBlank
	private String email;
	@NotBlank
	private String password;
	
}
