// [目的] 申請詳細APIのレスポンスに含める「履歴actions」の1要素を表すDTOを提供する // このファイルの目的を説明する
// [呼び出し元/使用箇所] RequestsController が RequestDetailResponse.actions に入れて返す要素として使う // どこから使われるかを説明する
// [入力と出力] 入力=コンストラクタ引数(action/fromStatus/toStatus/comment/createdAt/actorId) 出力=getter経由でJSON化される値 // 入出力を説明する
// [依存／前提] Lombok(@Getter/@AllArgsConstructor) と SpringのJackson変換が有効である前提で動作する // 依存関係を説明する
// [今回変更点] 設計の「詳細+履歴actionsを含む」を満たすため、actions要素DTOを新設した（現段階は空配列で返す土台） // 今回変更点を説明する


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
