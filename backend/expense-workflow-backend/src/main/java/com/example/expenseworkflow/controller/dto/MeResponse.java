// [目的] GET /api/me が「ログイン中=200」のときに返すユーザー情報（id/email/role）を表現するDTOを提供する // ファイルの役割
// [呼び出し元/使用箇所] MeController がセッション情報から組み立てて返却する // どこから使われるか
// [入力と出力] 入力=セッションに保存したユーザー情報 / 出力=JSONとして返るDTO（getterでシリアライズ） // 入出力
// [依存／前提] Jackson（Spring Webの標準）でgetterによりJSON化される前提／passwordは含めない // 依存と前提

package com.example.expenseworkflow.controller.dto;

import lombok.Data;

@Data // アクセッサ
public class MeResponse {
	  private Long id; // ログイン中ユーザーIDを保持する
	  private String email; // ログイン中ユーザーemailを保持する
	  private String role; // ログイン中ユーザーroleを保持する

}
