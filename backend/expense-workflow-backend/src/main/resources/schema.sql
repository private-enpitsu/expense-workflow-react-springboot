-- =============================================
-- expense_workflow_db  テーブル定義
-- Spring Boot 起動時に自動実行される schema.sql
-- CREATE TABLE IF NOT EXISTS で冪等（何度実行しても安全）
-- =============================================

CREATE TABLE IF NOT EXISTS `users` (
  `id`          BIGINT       NOT NULL AUTO_INCREMENT COMMENT 'ユーザーID',
  `email`       VARCHAR(255) NOT NULL                COMMENT 'メールアドレス（ログインID）',
  `password_hash` VARCHAR(255) NOT NULL              COMMENT 'BCryptハッシュ化済みパスワード',
  `name`        VARCHAR(100) NOT NULL                COMMENT '表示名',
  `role`        VARCHAR(20)  NOT NULL                COMMENT 'ロール（APPLICANT / APPROVER など）',
  `manager_id`  BIGINT       NULL DEFAULT NULL       COMMENT '上長ユーザーID（自テーブル参照）',
  `is_active`   TINYINT(1)   NOT NULL DEFAULT '1'   COMMENT '有効フラグ（1:有効 / 0:無効）',
  `created_at`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='ユーザー';


CREATE TABLE IF NOT EXISTS `expense_requests` (
  `id`                   BIGINT       NOT NULL AUTO_INCREMENT COMMENT '申請ID',
  `applicant_id`         BIGINT       NOT NULL               COMMENT '申請者ユーザーID',
  `current_approver_id`  BIGINT       NULL DEFAULT NULL      COMMENT '現在の承認者ユーザーID',
  `title`                VARCHAR(200) NOT NULL               COMMENT '申請タイトル',
  `expense_date`         DATE         NULL DEFAULT NULL      COMMENT '経費発生日',
  `apply_date`           DATE         NULL DEFAULT NULL      COMMENT '申請日',
  `amount`               INT          NOT NULL               COMMENT '金額',
  `purpose`              TEXT         NULL DEFAULT NULL      COMMENT '目的・用途',
  `payment_method`       VARCHAR(30)  NULL DEFAULT NULL      COMMENT '支払方法',
  `status`               VARCHAR(20)  NOT NULL               COMMENT '申請ステータス',
  `submitted_at`         DATETIME     NULL DEFAULT NULL      COMMENT '提出日時',
  `approved_at`          DATETIME     NULL DEFAULT NULL      COMMENT '承認日時',
  `last_returned_at`     DATETIME     NULL DEFAULT NULL      COMMENT '最終差戻日時',
  `last_return_comment`  TEXT         NULL DEFAULT NULL      COMMENT '最終差戻コメント',
  `created_at`           DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`           DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `note`                 TEXT         NULL DEFAULT NULL      COMMENT '備考',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='経費申請';


CREATE TABLE IF NOT EXISTS `expense_request_actions` (
  `id`          BIGINT      NOT NULL AUTO_INCREMENT COMMENT 'アクションID',
  `request_id`  BIGINT      NOT NULL               COMMENT '対象申請ID',
  `actor_id`    BIGINT      NOT NULL               COMMENT '操作したユーザーID',
  `action`      VARCHAR(30) NOT NULL               COMMENT '操作種別（SUBMIT / APPROVE / REJECT など）',
  `from_status` VARCHAR(20) NULL DEFAULT NULL      COMMENT '操作前ステータス',
  `to_status`   VARCHAR(20) NULL DEFAULT NULL      COMMENT '操作後ステータス',
  `comment`     TEXT        NULL DEFAULT NULL      COMMENT 'コメント',
  `created_at`  DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='経費申請アクション履歴';
