package com.example.expenseworkflow.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class HealthControllerTests {
	
	@Autowired
	private MockMvc mockMvc;
	
	@Test
	void getHealth_returnsOkJson() throws Exception {
		
		//目的: アプリ起動後に /api/health が 200 と JSON を返すこと
		
		mockMvc.perform(get("/api/health")) // MockMvcで「GET /api/health」を疑似HTTPリクエストとして実行する（コントローラが呼ばれる）
	      .andExpect(status().isOk())   // 期待値：HTTPステータスコードが 200 OK であることを検証する
	      .andExpect(content().json("{\"status\":\"ok\"}")); // 期待値：レスポンス本文がJSONとして {"status":"ok"} と一致することを検証する（順序差などはJSON比較で吸収）

	}

}
