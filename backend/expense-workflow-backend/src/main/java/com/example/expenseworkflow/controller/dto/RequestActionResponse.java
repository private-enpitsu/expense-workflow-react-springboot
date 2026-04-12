/**
 * 申請詳細レスポンスに含まれる操作履歴（actions配列）の1要素を表すDTOクラス。
 * 操作種別・遷移前後のステータス・コメント・操作日時・操作者IDを保持する。
 */

package com.example.expenseworkflow.controller.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

// actions配列の1要素を表すDTOクラスを定義する
@Getter
@AllArgsConstructor
public class RequestActionResponse {
	private String action; // 操作種別（例：CREATE/SUBMIT/APPROVE 等）を表す文字列を保持する
	private String fromStatus; // 遷移元ステータス（不明な場合はnullになり得る）を保持する
	private String toStatus; // 遷移先ステータス（不明な場合はnullになり得る）を保持する
	private String comment; // 操作コメント（差戻し理由など）を保持する
	private String createdAt; // 操作日時（ISO文字列など）を保持する（形式は後でSOT統一する前提）
	private Long actorId; // 操作したユーザーIDを保持する
}
