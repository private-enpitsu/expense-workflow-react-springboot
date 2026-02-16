// このファイルは、状態遷移とInbox（承認者の受信箱）を担当する WorkflowController を提供するために存在します。 // 目的を自然文で説明する
// このControllerは、フロントのInbox画面が GET /api/inbox を呼ぶときの入口として利用されます。 // 呼び出し元/使用箇所を自然文で説明する
// 入力はHTTPリクエストで、出力は InboxItemResponse の配列（今回はダミー2件）です。 // 入力と出力を自然文で説明する
// 依存は Spring Web（RestController等）と、DTOをJSONに変換するJackson（Spring標準）です。 // 依存関係を自然文で説明する
// 今回は /api/inbox が空配列ではなくダミー2件を返すようにして、一覧APIの形を先に確定します。 // 今回変更点を自然文で説明する

package com.example.expenseworkflow.controller;

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
		
		 // ダミーとして一覧を作る
		InboxItemResponse item1 = new InboxItemResponse("REQ-001", "経費申請（交通費）", 1200, "SUBMITTED"); // ダミー1件目
		InboxItemResponse item2 = new InboxItemResponse("REQ-002", "経費申請（備品購入）", 9800, "SUBMITTED"); // ダミー2件目
		
		return List.of(item1, item2); // ダミー2件の配列を返して、JSON配列の形を確定する
	}

}
