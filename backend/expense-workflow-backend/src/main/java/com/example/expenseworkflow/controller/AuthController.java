/**
 * ログイン・ログアウトAPIを提供するコントローラクラス。
 * <ul>
 *   <li>POST /api/auth/login  : email/passwordをDBと照合し、成功時にセッションへuserIdを保存する</li>
 *   <li>POST /api/auth/logout : セッションからuserIdを削除して未ログイン状態に戻す</li>
 * </ul>
 * パスワード照合にはBCryptを使用し、認証情報はサーバサイドセッションで管理する。
 */

package com.example.expenseworkflow.controller;

import jakarta.servlet.http.HttpSession;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.expenseworkflow.controller.dto.LoginRequest;
import com.example.expenseworkflow.domain.User;
import com.example.expenseworkflow.mapper.UserMapper;


// ログインAPIを提供するコントローラクラス
@RestController
@RequestMapping("/api/auth")
public class AuthController {
	
	// セッションに保存するキーを定義する
	private static final String SESSION_KEY_USER_ID = "SESSION_KEY_USER_ID";
	private final UserMapper userMapper;
	private final BCryptPasswordEncoder passwordEncoder;
	
	public AuthController(UserMapper userMapper) {
		this.userMapper = userMapper;
		this.passwordEncoder = new BCryptPasswordEncoder();
	}
	

	
	@PostMapping("/login") // POST /api/auth/login をこのメソッドで処理する
	public ResponseEntity<Void> login(@RequestBody LoginRequest body, HttpSession session) {
	
		if (body == null || body.getEmail() == null || body.getPassword() == null) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
		}
		
		User user = userMapper.findByEmail(body.getEmail());
		if (user == null) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}
		
		boolean ok = passwordEncoder.matches(body.getPassword(),  user.getPasswordHash());
		if (!ok) { // パスワードが一致しなければログイン失敗として扱う
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
		
		session.setAttribute(SESSION_KEY_USER_ID, user.getId());
		return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
	}
	
	@PostMapping("/logout") // POST /api/auth/logout をこのメソッドで処理する
	public ResponseEntity<Void> logout(HttpSession session) {
		session.removeAttribute(SESSION_KEY_USER_ID);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
	}
	
	


}
