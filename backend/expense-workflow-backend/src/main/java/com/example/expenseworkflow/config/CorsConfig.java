package com.example.expenseworkflow.config;

import org.springframework.context.annotation.Configuration; // 設定クラスとして登録するために使う
import org.springframework.web.servlet.config.annotation.CorsRegistry; // CORS許可ルールを登録するために使う
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer; // Spring MVCの設定を拡張するために実装する

@Configuration // このクラスをSpringが設定ファイル（クラス）として利用する設定を有効化する
public class CorsConfig implements WebMvcConfigurer { // CORS設定を追加するためにWebMvcConfigurerを実装する

	@Override // 親インターフェースのメソッドを上書きしてCORSルールを登録する
	public void addCorsMappings(CorsRegistry registry) {
		registry.addMapping("/api/**") // /api配下のエンドポイントにだけCORSを適用する（最小適用）
				.allowedOrigins( // 許可するフロントのOrigin（開発用の最小セット）
						"http://localhost:5173", // Viteのデフォルト開発サーバOrigin
						"http://localhost:3000" // もし3000で動かす場合にも対応（最小の追加）
				)
				.allowedMethods("GET") // 今回はhealth確認のみなのでGETだけ許可（最小）
				.allowedHeaders("*"); // 送信ヘッダは一旦全許可（healthでは実害が少ないため）
	}

}
