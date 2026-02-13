// [目的] /api/requests の POST 入力（title/amount/note）を受け取るDTOを提供する // このファイルの目的を説明する
// [呼び出し元/使用箇所] RequestsController.createRequest(@RequestBody ...) の引数としてJacksonが生成する // どこで使われるかを説明する
// [入力と出力] 入力=JSON { title, amount, note } / 出力=Controllerが参照するgetter（Lombokで生成） // 入出力を説明する
// [依存／前提] Lombok(@Data) と SpringのJackson変換が有効である前提で動作する // 依存関係を説明する
// [今回変更点] Controller内DTOを廃止し、dtoパッケージへ移動して定義を一本化した // 今回の変更点を説明する

package com.example.expenseworkflow.controller.dto; // RequestsControllerからimportして使うdtoパッケージを宣言する

import lombok.Data; // getter/setter等を生成してJSON入力を受け取りやすくするために@Dataを使うので読み込む

@Data // title/amount/note のアクセサを自動生成してControllerが参照できるようにする
public class CreateRequestRequest { // POST入力を受け取るためのDTOクラスを定義する
	private String title; // 申請の件名を受け取るフィールドを定義する
	private int amount; // 申請の金額を受け取るフィールドを定義する
	private String note; // 申請の備考を受け取るフィールドを定義する
} // DTOクラス定義を閉じる
