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
		if (userIdObj == null) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}
		
		Long userId = (userIdObj instanceof Long) ? (Long) userIdObj : null;
		if (userId == null) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}
		
		User user = userMapper.findById(userId);
		if (user == null) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}
		
		MeResponse body  = new MeResponse();
		body.setId(user.getId());
		body.setEmail(user.getEmail());
		body.setRole(user.getRole());
		
		
		return ResponseEntity.ok(body);
		
	}
	


}
