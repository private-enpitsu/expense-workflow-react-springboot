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

import com.example.expenseworkflow.controller.dto.MeResponse; // /api/me が200のときに返すレスポンスDTO型を参照するために読み込む
import com.example.expenseworkflow.domain.User;
import com.example.expenseworkflow.mapper.UserMapper;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class MeController { // /api/me を提供するコントローラ
	
	private static final String SESSION_KEY_USER_ID = "SESSION_KEY_USER_ID"; // AuthController と同じキーでユーザーIDを読む
	private final UserMapper userMapper;
	
//	public MeController(UserMapper userMapper) { // コンストラクタDIで UserMapper を受け取る
//		this.userMapper = userMapper;
//	}
	
	@GetMapping("/me")
	public ResponseEntity<MeResponse> me(HttpSession session) {
		
		Object userIdObj = session.getAttribute(SESSION_KEY_USER_ID);
		if (userIdObj == null) { // セッションにユーザーIDが無い場合は未ログインとして扱います。
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build(); // 未ログイン=401 を返す（設計書の前提）
		}
		
		Long userId = (userIdObj instanceof Long) ? (Long) userIdObj : null; // 型が想定外なら null 扱いにして安全側に倒す
		if (userId == null) { // セッション値の型が想定と違う場合は整合性が取れないため未ログイン扱いにします。
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}
		
		User user = userMapper.findById(userId); // userId がDB上に存在するかを確認する（存在しないならセッション不整合）
		if (user == null) { // DBに該当ユーザーが存在しない場合はセッション不整合として未ログイン扱いにします。
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}
		
		com.example.expenseworkflow.controller.dto.MeResponse body  = new MeResponse(); // 返却用DTOを作り、公開してよい情報だけを詰めます。 
		body.setId(user.getId()); // フロントが識別に使えるようユーザーIDを設定します。
		body.setEmail(user.getEmail()); // ナビ表示に使えるようemailを設定します。
		body.setRole(user.getRole()); // 将来のロール別表示制御に使えるようroleを設定します。
		
		
		return ResponseEntity.ok(body); // 200とJSONボディを返してフロントがユーザー情報を表示できるようにします。
		
	}
	


}
