// [目的] GET /api/requests/{id} のレスポンスとして「申請詳細+履歴actions」を返すDTOを提供する // このファイルの目的を説明する
// [呼び出し元/使用箇所] RequestsController.getRequestDetail が ResponseEntity.ok(...) で返すボディとして使う // どこから使われるかを説明する
// [入力と出力] 入力=コンストラクタ引数(id/title/amount/status/note/actions) 出力=getter経由でJSON化される値 // 入出力を説明する
// [依存／前提] Lombok(@Getter/@AllArgsConstructor) と SpringのJackson変換が有効である前提で動作する // 依存関係を説明する
// [今回変更点] 設計API一覧の「申請詳細取得（詳細+履歴actionsを含む）」に合わせ、詳細レスポンスDTOを新設した // 今回変更点を説明する

package com.example.expenseworkflow.controller.dto; // Controller入出力DTOの置き場として統一したパッケージを宣言する

import java.util.List; // actionsを配列で保持するためにListを使うので読み込む

import lombok.AllArgsConstructor; // 全引数コンストラクタを自動生成して組み立てを簡単にするために読み込む
import lombok.Getter; // JSON化で参照されるgetterを自動生成するために読み込む

// 申請詳細レスポンスDTOクラスを定義する
@Getter
@AllArgsConstructor
public class RequestDetailResponse {
	private String id; // 申請ID（例：REQ-001）を返すフィールドを保持する
	private String title; // 件名を返すフィールドを保持する
	private int amount; // 金額を返すフィールドを保持する
	private String status; // ステータス（例：DRAFT/SUBMITTED/APPROVED）を返すフィールドを保持する
	private String note; // 備考を返すフィールドを保持する
	private List<RequestActionResponse> actions; // 履歴actionsを配列で返すフィールドを保持する
} // DTOクラス定義を閉じる
