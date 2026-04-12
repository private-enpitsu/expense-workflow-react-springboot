/**
 * 経費申請ワークフローアプリのSpring Bootエントリポイント。
 * {@link org.springframework.boot.SpringApplication#run} を呼び出してアプリを起動する。
 */

package com.example.expenseworkflow;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ExpenseWorkflowBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(ExpenseWorkflowBackendApplication.class, args);
	}

}
