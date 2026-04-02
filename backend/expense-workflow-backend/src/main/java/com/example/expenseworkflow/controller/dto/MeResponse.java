// GET /api/me が「ログイン中=200」のときに返すユーザー情報（id/email/role）を表現するDTOを提供する

package com.example.expenseworkflow.controller.dto;

import lombok.Data;

@Data
public class MeResponse {
	  private Long id; // ログイン中ユーザーIDを保持する
	  private String email; // ログイン中ユーザーemailを保持する
	  private String role; // ログイン中ユーザーroleを保持する

}
