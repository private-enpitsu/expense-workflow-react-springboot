// [目的] 差戻し（RETURNED）操作の入力として、コメント文字列を受け取るDTOを提供する // このファイルの目的を説明する
// [呼び出し元/使用箇所] WorkflowController.returnRequest(@RequestBody ...) の引数としてJacksonが生成する // どこで使われるかを説明する
// [入力と出力] 入力=JSON { comment } / 出力=Controllerが参照するgetter（Lombokで生成） // 入出力を説明する
// [依存／前提] Lombok(@Data) と SpringのJackson変換が有効である前提で動作する // 依存関係を説明する
// [今回変更点] 差戻しコメントをAPIで受け取れるようにするために新規追加した // 今回変更点を説明する

package com.example.expenseworkflow.controller.dto; // Controllerからimportして使うdtoパッケージを宣言する

import lombok.Data;

@Data
public class ReturnRequestRequest { // 差戻しコメントを受け取るためのDTOクラスを定義する
	private String comment; // 差戻し理由などのコメント文字列を受け取るフィールドを定義する
}