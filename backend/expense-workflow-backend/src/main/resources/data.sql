-- =============================================
-- expense_workflow_db  初期データ
-- Spring Boot 起動時に自動実行される data.sql
-- INSERT IGNORE で冪等（重複実行しても安全）
-- =============================================

-- user1@example.com（APPLICANT / 上長: id=2）
INSERT IGNORE INTO `users`
  (`id`, `email`, `password_hash`, `name`, `role`, `manager_id`, `is_active`)
VALUES
  (1,
   'user1@example.com',
   '$2b$10$Yeuk047KpYk4zi19uYle7ueRNBWb8yh/IO/4ShH2MiYNyHglKIcze',
   'Approver 1',
   'APPLICANT',
   2,
   1);

-- admin1@example.com（APPROVER / 上長なし）
INSERT IGNORE INTO `users`
  (`id`, `email`, `password_hash`, `name`, `role`, `manager_id`, `is_active`)
VALUES
  (2,
   'admin1@example.com',
   '$2b$10$Yeuk047KpYk4zi19uYle7ueRNBWb8yh/IO/4ShH2MiYNyHglKIcze',
   'Admin 1',
   'APPROVER',
   NULL,
   1);
