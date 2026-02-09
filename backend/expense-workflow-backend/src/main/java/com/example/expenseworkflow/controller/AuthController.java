// [目的] POST /api/auth/login でDBの users を照合し、ログイン成功時にセッションへユーザー情報を保存する（最小ログイン） // ファイルの役割
// [呼び出し元/使用箇所] フロントの useMutation(login) などが呼び、成功後に ['me'] をinvalidateして /api/me を再取得する想定 // どこから使われるか
// [入力と出力] 入力=JSON { email, password } / 出力=成功:204(セッション作成)・失敗:401(認証失敗)・不正入力:400 // 入出力
// [依存／前提] MyBatis(UserMapper)で users を参照／BCryptで password_hash を照合／セッションはHttpOnly Cookie(JSESSIONID)前提 // 依存と前提

package com.example.expenseworkflow.controller;

import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController { // ログインAPIを提供するコントローラクラス
	
	// セッションに保存するキーを定義する
	private static final String SESSION_USER_ID = "LOGIN_USER_ID";
	private static final String SESSION_USER_EMAIL = "LOGIN_USER_EMAIL";
	private static final String SESSION_USER_ROLE = "LOGIN_USER_ROLE";
	
	private final UserMapper userMapper; // usersを参照するMapperを保持する
	private final BCryptPasswordEncoder passwordEncoder; // password_hash照合のためのエンコーダを保持する
	
	// SpringのDIでUserMapperを受け取るコンストラクタ
	public AuthController(UserMapper userMapper) {
		this.userMapper = userMapper;
		this.passwordEncoder = new BCryptPasswordEncoder(); // BCrypt照合器をここで生成して保持する（最小構成）
	}

	@PostMapping("/login") //POST /api/auth/login を定義する
	public ResponseEntity<Void> login(@Valid @RequestBody LoginRequest request, HttpSession session){
		
		UserAuth user = userMapper.selectAuthByEmail(request.getEmail()); // emailで users を検索して認証に必要な情報を取得する
		if (user == null) { // 該当ユーザーが存在しない場合
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build(); // 認証失敗として401を返す
		}
		
		boolean passwordOK = passwordEncoder.maches(request.getPassword(), user.getPasswordHash()); // 入力パスワードとDBのpassword_hashをBCryptで照合する
		if (!passwordOK) { // パスワードが一致しない場合
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build(); // 認証失敗として401を返す
		}
		
		// /api/me が200を返すためにセッションへ保存する
		session.setAttribute(SESSION_USER_ID, user.getId());
		session.setAttribute(SESSION_USER_EMAIL, user.getEmail());
		session.setAttribute(SESSION_USER_ROLE, user.getRole());
		
		return ResponseEntity.noContent().build(); // ログイン成功として204（ボディ無し）を返す
	}
}
