// users から取得する「認証に必要な最小情報（passwordHash含む）」を保持するための型を提供する

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

