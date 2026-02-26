-- =============================================
-- expense_workflow_db  初期データ
-- Spring Boot 起動時に自動実行される data.sql
-- INSERT IGNORE で冪等（重複実行しても安全）
-- =============================================

-- user1@example.com（APPLICANT / 上長: id=2）
REPLACE INTO `users`
  (`id`, `email`, `password_hash`, `name`, `role`, `manager_id`, `is_active`)
VALUES
  (1,
   'user1@example.com',
   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
   'Approver 1',
   'APPLICANT',
   2,
   1);

REPLACE INTO `users`
  (`id`, `email`, `password_hash`, `name`, `role`, `manager_id`, `is_active`)
VALUES
  (2,
   'admin1@example.com',
   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
   'Admin 1',
   'APPROVER',
   NULL,
   1);