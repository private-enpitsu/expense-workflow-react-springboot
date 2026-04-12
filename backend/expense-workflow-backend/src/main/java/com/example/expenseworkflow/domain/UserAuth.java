/**
 * ログイン認証に必要な最小限のユーザー情報を保持するドメインクラス。
 * {@link User} と異なり、パスワードハッシュを含む認証専用の型として定義する。
 * BCryptによるパスワード照合にのみ使用し、APIレスポンスには含めない。
 */

package com.example.expenseworkflow.domain;

import lombok.Data;

// 認証に必要なユーザー情報を保持するクラス
@Data
public class UserAuth {
	private Long id; // users.id を保持する
	private String email; // users.email を保持する
	private String passwordHash; // users.password_hash を camelCase で保持する
	private String role; // users.role を保持する（例: APPLICANT/APPROVER/ADMIN）
}

