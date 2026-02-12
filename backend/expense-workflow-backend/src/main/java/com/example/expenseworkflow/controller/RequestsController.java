// [目的] 申請一覧を返す GET /api/requests を提供して、フロントが「ダミー表示→API接続表示」へ進められるようにする // ファイルの役割を明確にする
// [呼び出し元/使用箇所] frontend の RequestsListPage が TanStack Query で GET /api/requests を呼び出す // どこから使われるかを明確にする
// [入力と出力] 入力=なし（セッション認証は将来適用） / 出力=申請サマリ配列（id/amount/status）をJSONで返す // 入出力を明確にする
// [依存／前提] Spring Web（@RestController） / Jackson（POJOをJSON化） // 依存と前提を書く
// [今回変更点] まずは固定データ3件を返すだけのAPIを追加し、フロントのAPI接続を先に成立させる // 1ステップ=1概念を守る

package com.example.expenseworkflow.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.AllArgsConstructor;
import lombok.Getter;

@RestController
@RequestMapping("/api")
public class RequestsController {
	
	@GetMapping("/requests")
	public List<RequestSummaryResponse> listRequests() {
		
		return List.of(
				new RequestSummaryResponse("REQ-001", 1200, "DRAFT"),
				new RequestSummaryResponse("REQ-002", 5000, "SUBMITTED"),
				new RequestSummaryResponse("REQ-003", 300, "APPROVED")
				);
	}
	
	@Getter // JacksonがJSON化できるようにgetterを用意して、申請ID、金額、状態、を返す
	@AllArgsConstructor	// コンストラクタ
	public static class RequestSummaryResponse {
		
		private String id;
		private int amount;
		private String status;

	}

}
