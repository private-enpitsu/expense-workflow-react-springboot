// [目的] /api/me を「ログイン状態判定の正」として、未ログイン=401／ログイン中=200（ユーザー情報返却）を確定する // ファイルの役割
// [呼び出し元/使用箇所] フロントの useQuery(['me']) が GET /api/me を呼び、200/401でログイン状態を判定する // どこから使われるか
// [入力と出力] 入力=HTTP GET /api/me / 出力=未ログイン:401、ログイン中:200＋MeResponse(JSON) // 入出力
// [依存／前提] AuthController がセッションへ保存した LOGIN_USER_* を参照する前提（HttpSession） // 依存と前提


package com.example.expenseworkflow.controller;

import jakarta.servlet.http.HttpSession;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.expenseworkflow.controller.dto.MeResponse;

@RestController
@RequestMapping("/api")
public class MeController { // /api/me を提供するコントローラ
	
	private static final String SESSION_USER_ID = "LOGIN_USER_ID"; // AuthController と同じキーでユーザーIDを読む
	private static final String SESSION_USER_EMAIL = "LOGIN_USER_EMAIL";
	private static final String SESSION_USER_ROLE = "LOGIN_USER_ROLE";
	
	// セッションを受け取り、ログイン状態に応じて200/401を返す
	@GetMapping("/me")
	public ResponseEntity<?> me(HttpSession session) {
		
		Object idObj = session.getAttribute(SESSION_USER_ID); // ログイン中なら保存されているはずのユーザーIDを取得する
		
		if (idObj == null) { // セッションにユーザーIDが無い場合（未ログインと判断）
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build(); // 常に401を返すメソッドResponseEntity（ログイン実装後に200返却へ拡張する）
		}
		
		MeResponse body = new MeResponse(); // 200の時に返すボディを組み立てる
		body.setId((Long) idObj); // Long にキャスト
		body.setEmail((String) session.getAttribute(SESSION_USER_EMAIL)); // セッションのemailをレスポンスへ詰める
		body.setRole((String) session.getAttribute(SESSION_USER_ROLE));
		
		return ResponseEntity.ok(body); // ログイン中として200＋JSONボディを返す
	}

}
