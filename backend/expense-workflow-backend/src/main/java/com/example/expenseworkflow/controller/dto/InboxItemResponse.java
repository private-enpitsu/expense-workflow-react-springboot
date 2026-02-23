// [目的] GET /api/inbox の返却で使う「承認待ち一覧の1行」を表すDTOを提供する // このファイルの目的を自然文で説明する
// [呼び出し元/使用箇所] WorkflowController.getInbox が List<InboxItemResponse> を返す要素として使う // どこで使われるかを自然文で説明する
// [入力と出力] 入力=コンストラクタ引数(requestId/title/amount/status) / 出力=getter経由でJSON化される値である // 入出力を自然文で説明する
// [依存／前提] Lombok(@Getter/@AllArgsConstructor) と SpringのJackson変換が有効である前提で動作する // 依存関係を自然文で説明する
// [今回変更点] Controller内モデルの二重定義を避けるため、inbox用の返却DTOをcontroller/dtoに新設した // 今回変更点を自然文で説明する


package com.example.expenseworkflow.controller.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InboxItemResponse {
	
	private Long id;
	private String title; // 件名を返すフィールドを保持する
	private int amount; // 金額を返すフィールドを保持する
	private String status; // 状態（例：SUBMITTED）を返すフィールドを保持する

}
