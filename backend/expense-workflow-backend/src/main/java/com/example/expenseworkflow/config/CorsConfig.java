/**
 * CORS（クロスオリジンリソース共有）の許可ルールを一元管理するコンフィグクラス。
 * {@link WebMvcConfigurer#addCorsMappings} をオーバーライドし、
 * フロントエンド（Vite開発サーバ・Railwayデプロイ先）からのリクエストを許可する。
 * セッションCookieを使用するため {@code allowCredentials(true)} を設定している。
 */

package com.example.expenseworkflow.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;


@Configuration
public class CorsConfig implements WebMvcConfigurer {

	// 親インターフェースのメソッドを上書きしてCORSルールを登録する
    @Override
    public void addCorsMappings(CorsRegistry registry) { // CORSの許可パターンをここで設定する
        registry.addMapping("/api/**") // /api配下のエンドポイントにだけCORSを適用する（最小適用）
                .allowedOrigins( // 許可するフロントのOrigin（開発用の最小セット）
                        "http://localhost:5173", // Viteのデフォルト開発サーバOrigin
                        "http://localhost:3000",  // もし3000で動かす場合にも対応（最小の追加）
                        "https://sincere-empathy-production.up.railway.app" // RailwayフロントエンドURL
                )
                .allowedMethods("GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS") // CORSを許可する
                .allowedHeaders("*") // 送信ヘッダは一旦全許可（healthでは実害が少ないため）
                .allowCredentials(true); // Cookie（JSESSIONID）を送受信できるように credentials を許可する // セッション方式の必須要件
    }
}
