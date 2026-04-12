/**
 * usersテーブルの1レコードを表すドメインクラス（エンティティ）。
 * ユーザーID・email・表示名・ロール・上長ID・有効フラグ・パスワードハッシュを保持する。
 * ロール（APPLICANT/APPROVER等）によってアクセスできるAPIが異なる。
 */

package com.example.expenseworkflow.domain;

import lombok.Data;

@Data
public class User {
	
	private Long id; // users.id（主キー） // 行コメント
    private String email; // users.email（ログインID） // 行コメント
    private String name; // users.name（表示名） // 行コメント
    private String role; // users.role（APPLICANT/APPROVER など） // 行コメント
    private Long managerId; // users.manager_id（上長の user_id） // 行コメント
    private Boolean isActive; // users.is_active（有効/無効） // 行コメント
    private String passwordHash; // users.password_hash（BCryptのハッシュ、ログイン照合にのみ使用） // 行コメント

}
