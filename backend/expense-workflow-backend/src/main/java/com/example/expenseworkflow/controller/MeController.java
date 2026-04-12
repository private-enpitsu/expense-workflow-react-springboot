/**
 * ログイン状態の確認とログイン中ユーザー情報の返却を担うコントローラクラス。
 * GET /api/me に対し、セッションにuserIdが存在すれば200＋ユーザー情報を返し、
 * 未ログインの場合は401を返す。フロントエンドのログイン状態判定の正として機能する。
 */

package com.example.expenseworkflow.controller;

import jakarta.servlet.http.HttpSession;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.expenseworkflow.controller.dto.MeResponse;
import com.example.expenseworkflow.domain.User;
import com.example.expenseworkflow.mapper.UserMapper;

import lombok.RequiredArgsConstructor;

// /api/me を提供するコントローラ
@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class MeController {
	
	private static final String SESSION_KEY_USER_ID = "SESSION_KEY_USER_ID"; // AuthController と同じキーでユーザーIDを読む
	private final UserMapper userMapper;
	
	
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
		
		MeResponse body  = new MeResponse(); // 返却用DTOを作り、公開してよい情報だけを詰めます。 
		body.setId(user.getId()); // フロントが識別に使えるようユーザーIDを設定します。
		body.setEmail(user.getEmail()); // ナビ表示に使えるようemailを設定します。
		body.setRole(user.getRole()); // 将来のロール別表示制御に使えるようroleを設定します。
		
		
		return ResponseEntity.ok(body); // 200とJSONボディを返してフロントがユーザー情報を表示できるようにします。
		
	}
	


}
