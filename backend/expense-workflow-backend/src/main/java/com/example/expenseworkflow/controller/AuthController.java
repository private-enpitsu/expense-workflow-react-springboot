// [目的] POST /api/auth/login でDBの users を照合し、ログイン成功時にセッションへユーザー情報を保存する（最小ログイン） // ファイルの役割
// [呼び出し元/使用箇所] フロントの useMutation(login) などが呼び、成功後に ['me'] をinvalidateして /api/me を再取得する想定 // どこから使われるか
// [入力と出力] 入力=JSON { email, password } / 出力=成功:204(セッション作成)・失敗:401(認証失敗)・不正入力:400 // 入出力
// [依存／前提] MyBatis(UserMapper)で users を参照／BCryptで password_hash を照合／セッションはHttpOnly Cookie(JSESSIONID)前提 // 依存と前提

package com.example.expenseworkflow.controller;

import jakarta.servlet.http.HttpSession;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.expenseworkflow.controller.dto.LoginRequest; // login入力DTOをcontroller外のファイル定義で統一するために読み込む
import com.example.expenseworkflow.domain.User; // users の1行を表すドメインを使うために読み込む
import com.example.expenseworkflow.mapper.UserMapper; // users を検索するMyBatis Mapperを使うために読み込む


@RestController
@RequestMapping("/api/auth")
public class AuthController { // ログインAPIを提供するコントローラクラス
	
	// セッションに保存するキーを定義する
	private static final String SESSION_KEY_USER_ID = "SESSION_KEY_USER_ID"; // セッションに保存する userId のキー名（MeController と一致させる）
	private final UserMapper userMapper; // email から user を取得する依存（DIで受け取る）
	private final BCryptPasswordEncoder passwordEncoder; // BCrypt 照合を行うためのエンコーダ（使い回し）
	
	public AuthController(UserMapper userMapper) { // コンストラクタDIで必要な依存を受け取る
		this.userMapper = userMapper;
		this.passwordEncoder = new BCryptPasswordEncoder(); // BCryptPasswordEncoder を生成する（spring-security-crypto 依存）
	}
	

	
	@PostMapping("/login") // POST /api/auth/login をこのメソッドで処理する
	public ResponseEntity<Void> login(@RequestBody LoginRequest body, HttpSession session) { // body と session を受け取り、成功ならセッションに userId を保存する
	
		if (body == null || body.getEmail() == null || body.getPassword() == null) { // 必須項目が無ければリクエスト不正として扱う
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).build(); // 400 を返す（未ログイン=401とは分ける）
		}
		
		User user = userMapper.findByEmail(body.getEmail()); // email から user を検索する（存在しないなら null）
		if (user == null) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}
		
		boolean ok = passwordEncoder.matches(body.getPassword(),  user.getPasswordHash()); // password と password_hash（BCrypt）を照合する
		if (!ok) { // パスワードが一致しなければログイン失敗として扱う
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
		
		session.setAttribute(SESSION_KEY_USER_ID, user.getId()); // ログイン成功なのでセッションに userId を保存する（以後 /api/me が 200 になる）
		return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
	}
	
	@PostMapping("/logout") // POST /api/auth/logout をこのメソッドで処理する
	public ResponseEntity<Void> logout(HttpSession session) { // セッションを受け取り、ログアウトとして userId を破棄する
		session.removeAttribute(SESSION_KEY_USER_ID); // セッションから userId を削除して未ログイン状態に戻す
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
	}
	
	


}
