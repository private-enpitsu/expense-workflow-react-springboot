// [目的] /api/requests/{id} の PATCH 入力（title/amount/note）を受け取るDTOを提供する // このファイルの目的を説明する
// [呼び出し元/使用箇所] RequestsController.updateRequest(@RequestBody ...) の引数としてJacksonが生成する // どこで使われるかを説明する
// [入力と出力] 入力=JSON { title, amount, note } / 出力=Controllerが参照するgetter（Lombokで生成） // 入出力を説明する
// [依存／前提] Lombok(@Data) と SpringのJackson変換が有効である前提で動作する // 依存関係を説明する
// [今回変更点] 差戻し申請の編集保存（PATCH）を可能にするため、更新用DTOを新設した // 今回の変更点を説明する


package com.example.expenseworkflow.controller;

import lombok.Data;

@Data
public class UpdateRequestRequest {
  private String title; // 申請の件名を受け取るフィールドを定義する
  private int amount; // 金額を受け取るフィールドを定義する
  private String note; // 備考を受け取るフィールドを定義する
}
