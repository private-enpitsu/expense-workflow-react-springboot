// [目的] /api/requests の GET/POST の返却で使う「申請サマリ」を表すDTOを提供する // このファイルの目的を説明する
// [呼び出し元/使用箇所] RequestsController が new RequestSummaryResponse(...) で生成し、そのままJSONとして返す // どこで使われるかを説明する
// [入力と出力] 入力=コンストラクタ引数(id/title/amount/status/note) / 出力=getter経由でJSON化される値 // 入出力を説明する
// [依存／前提] Lombok(@Getter/@AllArgsConstructor) と SpringのJackson変換が有効である前提で動作する // 依存関係を説明する
// [今回変更点] Controller内DTOを廃止し、dtoパッケージへ移動して定義を一本化した // 今回の変更点を説明する

package com.example.expenseworkflow.controller.dto; // RequestsControllerからimportして使うdtoパッケージを宣言する

import lombok.AllArgsConstructor; // Controller側で簡単に生成できる全引数コンストラクタを作るために読み込む
import lombok.Getter; // JSON化のためにgetterを生成するために読み込む

@Getter // Jacksonがフィールド値を取得できるようにgetterを生成する
@AllArgsConstructor // Controllerで new するときに必要な全引数コンストラクタを生成する
public class RequestSummaryResponse { // 申請サマリを表す返却DTOクラスを定義する
	private String id; // 申請ID（例：REQ-001）を返すフィールドを定義する
	private String title; // 件名を返すフィールドを定義する
	private int amount; // 金額を返すフィールドを定義する
	private String status; // 状態（例：DRAFT）を返すフィールドを定義する
	private String note; // 備考を返すフィールドを定義する
} // DTOクラス定義を閉じる
