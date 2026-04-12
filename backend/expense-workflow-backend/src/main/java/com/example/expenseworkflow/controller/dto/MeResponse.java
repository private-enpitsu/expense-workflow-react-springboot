/**
 * GET /api/me のレスポンスとして、ログイン中ユーザーの情報を返すDTOクラス。
 * パスワードハッシュ等の機密情報を除いた、フロントエンドへ公開してよい情報（id・email・role）のみを保持する。
 */

package com.example.expenseworkflow.controller.dto;

import lombok.Data;

@Data
public class MeResponse {
	  private Long id; // ログイン中ユーザーIDを保持する
	  private String email; // ログイン中ユーザーemailを保持する
	  private String role; // ログイン中ユーザーroleを保持する

}
