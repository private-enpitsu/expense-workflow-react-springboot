// /api/requests/{id} の PATCH 入力（title/amount/note）を受け取るDTOを提供する

package com.example.expenseworkflow.controller;

import lombok.Data;

@Data
public class UpdateRequestRequest {
  private String title; // 申請の件名を受け取るフィールドを定義する
  private int amount; // 金額を受け取るフィールドを定義する
  private String note; // 備考を受け取るフィールドを定義する
}
