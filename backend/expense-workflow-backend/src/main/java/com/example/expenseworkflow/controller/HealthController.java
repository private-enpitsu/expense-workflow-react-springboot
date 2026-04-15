/**
 * アプリケーションの起動確認用エンドポイントを提供するコントローラクラス。
 * GET /api/health に対して {@code {"status":"ok"}} を返すだけのシンプルな疎通確認API。
 * Railway等のデプロイ環境でのヘルスチェックにも利用できる。
 */

package com.example.expenseworkflow.controller;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// 起動確認用のhealth APIを提供するクラス
@RestController
@RequestMapping("/api")
public class HealthController {

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "ok");
    }
}
