package com.example.expenseworkflow.controller;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping
public class HealthController {
	
	
    /**
     * 疎通確認用。
     * ブラウザやcurlでアクセスして {"status":"ok"} が返ることを確認します。
     */
	@GetMapping("/health")
	public Map<String, String> health() {
		return Map.of("status", "ok"); //JSON: {"status":"ok"}
	}

}
