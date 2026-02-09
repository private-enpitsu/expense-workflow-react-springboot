// [目的] POST /api/auth/login の入力（email/password）を型として受け取るためのDTOを提供する // ファイルの役割
// [呼び出し元/使用箇所] AuthController.login(@RequestBody LoginRequest) から使用される // どこから使われるか
// [入力と出力] 入力=JSON { email, password } / 出力=Javaオブジェクト（getterで参照） // 入出力
// [依存／前提] jakarta.validation の @NotBlank により空文字を400として扱う（不正入力の早期検出） // 依存と前提

package com.example.expenseworkflow.controller.dto;

import jakarta.validation.constraints.NotBlank;

import lombok.Data;

// ログイン入力を受け取るDTOクラス
@Data //アクセッサ
public class LoginRequest {
	
	@NotBlank
	private String email;
	@NotBlank
	private String password;
	
}
