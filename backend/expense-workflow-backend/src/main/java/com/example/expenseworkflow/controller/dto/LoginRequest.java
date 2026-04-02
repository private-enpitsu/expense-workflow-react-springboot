// POST /api/auth/login の入力（email/password）を型として受け取るためのDTOを提供する

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
