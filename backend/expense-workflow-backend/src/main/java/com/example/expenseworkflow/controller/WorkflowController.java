
// [目的] ワークフロー操作（状態遷移）と承認者の受信箱（inbox）を担当するControllerを提供する // このファイルの目的を自然文で説明する
// [呼び出し元/使用箇所] フロントの InboxPage が GET /api/inbox を呼ぶ入口として使われる想定である // どこから呼ばれるかを自然文で説明する
// [入力と出力] 入力=HTTPリクエスト（現段階ではパラメータなし） / 出力=InboxItemResponse の配列（現段階は空配列）である // 入出力を自然文で説明する
// [依存／前提] Spring Web（@RestController 等）と Jackson（DTOのJSON化）が有効である前提で動作する // 依存と前提を自然文で説明する
// [今回変更点] API責務を分離（A）するために WorkflowController を新設し、GET /api/inbox を最小実装として追加した // 今回変更点を自然文で説明する

package com.example.expenseworkflow.controller;

import java.util.Collections;
import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.expenseworkflow.controller.dto.InboxItemResponse;

@RestController
@RequestMapping("/api")
public class WorkflowController {
	
	@GetMapping("/inbox")
	public List<InboxItemResponse> getInbox() { // 承認者の受信箱（承認待ち一覧）を返すメソッドを定義する
		return Collections.emptyList(); // 最小実装として空配列を返し、APIの存在と疎通（200）を先に成立させる
	}

}
