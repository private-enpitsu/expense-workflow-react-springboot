package com.example.expenseworkflow.domain;

import java.time.LocalDateTime;

import lombok.Data;

@Data // アクセッサ
public class User { // usersテーブル1行を表すドメインクラス
	
    private Long id; // users.id（PK）
    private String email; // users.email（ログインID）
    private String passwordHash; // users.password_hash（BCryptなどのハッシュ）
    private String name; // users.name（表示名）
    private String role; // users.role（APPLICANT/APPROVER/ADMIN）
    private Long managerId; // users.manager_id（上長ユーザーID）
    private Boolean isActive; // users.is_active（有効/無効）
    private LocalDateTime createdAt; // users.created_at（作成日時）
    private LocalDateTime updatedAt; // users.updated_at（更新日時）
}
