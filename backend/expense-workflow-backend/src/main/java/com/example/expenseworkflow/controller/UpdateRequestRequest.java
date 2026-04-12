/**
 * PATCH /api/requests/{id} の入力値を受け取るリクエストDTOクラス。
 * 差戻し（RETURNED）申請の編集保存時に、件名・金額・備考を受け取る。
 */

package com.example.expenseworkflow.controller;

import lombok.Data;

@Data
public class UpdateRequestRequest {
  private String title; // 申請の件名を受け取るフィールドを定義する
  private int amount; // 金額を受け取るフィールドを定義する
  private String note; // 備考を受け取るフィールドを定義する
}
