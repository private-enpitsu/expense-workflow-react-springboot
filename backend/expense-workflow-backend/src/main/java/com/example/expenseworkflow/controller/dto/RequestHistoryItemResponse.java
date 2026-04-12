/**
 * GET /api/requests/{id}/history・GET /api/inbox/{id}/history のレスポンスとして、
 * 申請の操作履歴1行を表すDTOクラス。
 * 操作種別・操作者名・操作日時・コメントを保持し、申請者・承認者の両方の履歴表示に使用する。
 */

package com.example.expenseworkflow.controller.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class RequestHistoryItemResponse {

    private final String action;     // 操作種別（SUBMIT・APPROVE等）
    private final String actorName;  // 操作者名（usersテーブルのname）
    private final String createdAt;  // 操作日時（YYYY/MM/DD HH:mm形式の文字列）
    private final String comment;    // コメント（差戻し以外はnull）
    
}
