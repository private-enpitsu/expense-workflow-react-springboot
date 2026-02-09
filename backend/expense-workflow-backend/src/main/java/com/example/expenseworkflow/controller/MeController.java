/*                                                                                 // ファイル先頭ヘッダコメント（必須）
  backend/expense-workflow-backend/src/main/java/com/example/expenseworkflow/controller/MeController.java
  目的: 設計書どおり「ログイン状態の判定は /api/me を正」とするためのエンドポイントを提供する // 200/401でログイン状態を表す土台
  呼び出し元/使用箇所: フロント（TanStack Queryの useQuery(['me'])）が GET /api/me を呼び、401なら未ログイン扱いにする // クライアントから参照される
  入力と出力: 入力=HTTP GET /api/me（現時点では入力パラメータなし） / 出力=HTTP 401（未ログイン）を返す // 今回は401だけを確定する
  依存／前提: Spring Web（@RestController, ResponseEntity）/ 認証（ログイン・セッション作成）は未実装のため、今回は常に401を返す // 未実装部分に依存しない
*/

package com.example.expenseworkflow.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class MeController {
	
	@GetMapping("/me")
	public ResponseEntity<Void> me() { // 本ステップでは「未ログイン=401」を確定するだけなのでボディ無し（Void）にする
		return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
	}

}
