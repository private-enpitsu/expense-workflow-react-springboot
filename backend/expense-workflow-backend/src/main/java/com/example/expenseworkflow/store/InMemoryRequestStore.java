// このファイルは、Phase1の「申請データ」をDBなしでメモリ保持するための SOT（正）として存在します。 // 目的を自然文で説明する
// RequestsController（CRUD）と WorkflowController（状態遷移＋Inbox）が同じ保存先を参照して二重定義を防ぐために使われます。 // 呼び出し元/使用箇所を自然文で説明する
// 入力は create/find/updateStatus 等の引数で、出力は RequestSummaryResponse や List です。 // 入力と出力を自然文で説明する
// 依存は Java標準（List/AtomicInteger）と controller/dto の RequestSummaryResponse です。 // 依存関係を自然文で説明する
// 今回は STORE/SEQ/初期データを RequestsController から移し、状態遷移APIが同じデータを更新できるようにします。 // 今回変更点を自然文で説明する

//
//package com.example.expenseworkflow.store;
//
//import java.util.ArrayList;
//import java.util.Collections;
//import java.util.List;
//import java.util.concurrent.atomic.AtomicInteger;
//
//import com.example.expenseworkflow.controller.dto.RequestSummaryResponse;
//
//// Phase1の申請をメモリ保持するSOTクラスを定義する
//public class InMemoryRequestStore {
//
//	private static final List<RequestSummaryResponse> STORE = new ArrayList<>(); // 申請一覧をメモリ上に保持する領域を用意する
//	private static final AtomicInteger SEQ = new AtomicInteger(3); // REQ-xxx の連番を採番するためのカウンタを用意する
//
//	// アプリ起動時に初期データを1回だけ投入するための静的初期化ブロックを定義する
//	static { // アプリ起動時に初期データを1回だけ投入するための静的初期化ブロックを定義する
//		STORE.add(new RequestSummaryResponse("REQ-001", "交通費精算", 1200, "DRAFT", "領収書あり")); // 1件目の初期データを追加する
//		STORE.add(new RequestSummaryResponse("REQ-002", "出張費", 5000, "SUBMITTED", "大阪出張")); // 2件目の初期データを追加する
//		STORE.add(new RequestSummaryResponse("REQ-003", "備品購入", 300, "APPROVED", "ペン購入")); // 3件目の初期データを追加する
//	}
//
//	// 申請一覧を返すメソッドを定義する
//	public static List<RequestSummaryResponse> list() {
//		return Collections.unmodifiableList(STORE); // 外から変更できない読み取り専用ビューを返して安全にする
//	}
//
//	// 申請を新規作成して保存するメソッドを定義する
//	public static RequestSummaryResponse create(String title, int amount, String note) {
//		int next = SEQ.incrementAndGet(); // 連番を1つ進めて新しい番号を作る
//		//incrementAndGet「AtomicInteger」- 値を 1 増やして 増やした後の値を返す
//		String id = String.format("REQ-%03d", next); // 連番を3桁ゼロ埋めしてID文字列にする
//		String safeTitle = title != null ? title : ""; // title が null でも落ちないように空文字へ寄せる
//		String safeNote = note != null ? note : "";// note が null でも落ちないように空文字へ寄せる
//		RequestSummaryResponse created = new RequestSummaryResponse(id, safeTitle, amount, "DRAFT", safeNote); // 作成直後は DRAFT のサマリを組み立てる
//		// "DRAFT" は「下書き（未確定・未申請）」という状態を表す識別子**「作成されたが、まだ提出・申請されていない状態」**を指します。
//		STORE.add(created); // フロントが成功を判断できるように作成した1件を返す
//		return created;
//	}
//
//	// id一致の申請サマリを1件探すメソッドを定義する
//	public static RequestSummaryResponse findById(String id) { // IDで1件取得する」**メソッドfindById
//
//		if (id == null) { // idがnullの場合の分岐をする
//			return null; // 探しようがないためnullを返す
//		}
//
//		// STOREの全要素を先頭から順に見る
//		for (RequestSummaryResponse r : STORE) {
//			if (r != null && id.equals(r.getId())) { // 要素がnullでなく、idが一致した場合の分岐をする
//				return r; // 見つかった要素を返す
//			}
//		}
//
//		return null; // どれにも一致しなからnullを返す
//	}
//
//	// 申請のstatusを更新するメソッドを定義する
//	public static RequestSummaryResponse updateStatus(String id, String nextStatus) {
//		RequestSummaryResponse current = findById(id); // 現在の申請サマリをidで探す IDで1件取得する」**メソッドfindById
//
//		if (current == null) { // 見つからなかった場合の分岐をする
//			return null;
//		}
//
//		String safeNextStatus = nextStatus != null ? nextStatus : current.getStatus(); // nextStatusがnullなら現状維持に寄せる
//		RequestSummaryResponse updated = new RequestSummaryResponse( // statusだけ変えた新しいサマリを作って置き換える
//				current.getId(), // idは同じ値を使う
//				current.getTitle(), // titleは同じ値を使う
//				current.getAmount(), // amountは同じ値を使う
//				safeNextStatus, // statusだけ更新後の値を使う
//				current.getNote() // noteは同じ値を使う
//		);
//
//		for (int i = 0; i < STORE.size(); i += 1) { // 一覧の中で該当要素の位置を探すために添字ループする
//			RequestSummaryResponse r = STORE.get(i); // i番目の要素を取り出す
//			if (r != null && id.equals(r.getId())) { // 探している id と、その要素の getId() が一致するか
//				STORE.set(i, updated); // その位置を更新後のサマリで置き換える
//				return updated; // 更新後のサマリを返す
//			} // 一致分岐を終える
//		} // ループを終える
//		return updated; // 通常は上でreturnして終了するが、念のためfindById と set の間で STORE の中身が変わった、などの“想定外”ケース用にupdatedを返す
//	}
//
//}
