package com.example.expenseworkflow.controller; // APIコントローラを置くパッケージ

import java.util.Map; // JSONとして返すための簡易Mapを使う

import org.springframework.web.bind.annotation.GetMapping; // GETエンドポイントを定義するために使う
import org.springframework.web.bind.annotation.RequestMapping; // ベースパスをまとめるために使う
import org.springframework.web.bind.annotation.RestController; // JSONを返すRESTコントローラとして宣言する

@RestController // このクラスがREST APIの入口で、返り値はJSONとして返す
@RequestMapping("/api") // APIのベースパスを /api に統一する
public class HealthController { // 起動確認用のhealth APIを提供するクラス

    @GetMapping("/health") // GET /api/health をこのメソッドに割り当てる
    public Map<String, String> health() { // 疎通確認のための最小レスポンスを返す
        return Map.of("status", "ok"); // 返却JSON: {"status":"ok"} を生成して返す
    } // メソッド終わり
} // クラス終わり
