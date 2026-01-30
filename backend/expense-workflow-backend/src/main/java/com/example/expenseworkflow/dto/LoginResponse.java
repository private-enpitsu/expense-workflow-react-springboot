package com.example.expenseworkflow.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor // コンストラクタ
@Getter // ゲッター
public class LoginResponse { // ログインAPIのレスポンス（最小：tokenのみ返す）

	private String token; // クライアントがAuthorizationヘッダに載せるトークン
	
//    public LoginResponse(String token) { // tokenを受け取って初期化するコンストラクタ
//        this.token = token; // 引数tokenをフィールドに保存する
//    }
	
//    public String getToken() { // tokenのgetter（JSONとして返すために必要）
//        return token; // フィールドtokenを返す
//    }

}
