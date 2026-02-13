// このファイルは、申請一覧を返すAPIと、申請を新規作成するAPIをまとめて提供します。 // このファイルの目的を自然文で説明する
// このAPIは、フロントの RequestsListPage と RequestCreatePage が /api/requests を通じて呼び出します。 // 呼び出し元を自然文で説明する
// 入力は、POST時のJSON（title/amount/note）で、出力は、申請サマリの配列または作成した1件のJSONです。 // 入出力を自然文で説明する
// 依存は、Spring Web と Jackson（POJOをJSON化）で、DBは使わずメモリ上に保持します。 // 依存と前提を自然文で説明する
// 今回は「作成→一覧に反映」を成立させるために、メモリ保存とID採番を追加しました。 // 今回変更点を自然文で説明する

package com.example.expenseworkflow.controller;

import java.util.ArrayList; // メモリ上のリストを作るためにArrayListを使うので読み込む
import java.util.Collections; // 読み取り専用ビューを返すためにCollectionsを使うので読み込む
import java.util.List; // 返却型としてListを使うので読み込む
import java.util.concurrent.atomic.AtomicInteger; // スレッド安全に採番するためAtomicIntegerを使うので読み込む

import org.springframework.web.bind.annotation.GetMapping; // GETのエンドポイントを定義するために読み込む
import org.springframework.web.bind.annotation.PostMapping; // POSTのエンドポイントを定義するために読み込む
import org.springframework.web.bind.annotation.RequestBody; // JSONボディを引数に受け取るために読み込む
import org.springframework.web.bind.annotation.RequestMapping; // コントローラ全体のパス接頭辞を付けるために読み込む
import org.springframework.web.bind.annotation.RestController; // RESTコントローラとして登録するために読み込む

import com.example.expenseworkflow.controller.dto.CreateRequestRequest;
import com.example.expenseworkflow.controller.dto.RequestSummaryResponse;


@RestController
@RequestMapping("/api")
public class RequestsController {
	
	private static final List<RequestSummaryResponse> STORE = new ArrayList<>();
	private static final AtomicInteger SEQ = new AtomicInteger(3);
	
	static { // アプリ起動時に初期データを1回だけ投入する（DB 実データ利用までのダミー）
		
		STORE.add(new RequestSummaryResponse("REQ-001", "交通費精算", 1200, "DRAFT", "領収書あり")); // 1件目の初期データを追加する
	    STORE.add(new RequestSummaryResponse("REQ-002", "出張費", 5000, "SUBMITTED", "大阪出張")); // 2件目の初期データを追加する
	    STORE.add(new RequestSummaryResponse("REQ-003", "備品購入", 300, "APPROVED", "ペン購入")); // 3件目の初期データを追加する
	  }
	
	@GetMapping("/requests")
	public List<RequestSummaryResponse> listRequests() { // 申請一覧を返すエンドポイントを定義する
		return Collections.unmodifiableList(STORE); // 外からの変更を避けるために読み取り専用ビューを返す
	}
	
	// 申請を新規作成して、作成したサマリを返す
	@PostMapping("/requests")
	public RequestSummaryResponse createRequest(@RequestBody CreateRequestRequest body) {
		int next = SEQ.incrementAndGet(); // 連番を1つ進めて新しい番号を作る
		String id = String.format("REQ-%03d", next); // 連番を3桁ゼロ埋めしてID文字列にする
		String safeTitle = body != null && body.getTitle() != null ? body.getTitle() : ""; // title が null でも落ちないように空文字へ寄せる
		int safeAmount = body != null ? body.getAmount() : 0; // amount が無い場合は 0 として扱う
		String safeNote = body != null && body.getNote() != null ? body.getNote() : ""; // note が null でも落ちないように空文字へ寄せる
		RequestSummaryResponse created = new RequestSummaryResponse(id, safeTitle, safeAmount, "DRAFT", safeNote); // 作成直後は DRAFT としてサマリを組み立てる
		STORE.add(created); // メモリ上の一覧に追加して、次のGETで見えるようにする
		return created; // フロントが成功を判断できるように作成した1件を返す
	}
	
	// DTO定義は controller/dto 配下に集約するため、このController内には定義しない // Controller内DTO禁止ルールに従う

//	@Data // アクセッサ
//	public static class CreateRequestRequest { // POST の入力ボディ（JSON）を受け取るための型を定義する
//		private String title;
//		private int amount;
//		private String note;
//	}
//	
//	@Getter // JacksonがJSON化できるようにgetterを用意して、申請ID、件名、金額、状態、備考、を返す
//	@AllArgsConstructor	// コンストラクタ // JSON用オブジェクトを組み立てるためのコンストラクタを定義する
//	public static class RequestSummaryResponse { // GET/POST の戻り値として返す「申請サマリ」を表す型を定義する
//		
//		private String id;
//		private String title;
//		private int amount;
//		private String status;
//		private String note;
//	}

}
