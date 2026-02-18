package com.example.expenseworkflow.store;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.example.expenseworkflow.controller.dto.InboxItemResponse;
import com.example.expenseworkflow.controller.dto.RequestSummaryResponse;
import com.example.expenseworkflow.domain.ExpenseRequest;
import com.example.expenseworkflow.domain.User;
import com.example.expenseworkflow.mapper.ExpenseRequestMapper;
import com.example.expenseworkflow.mapper.UserMapper;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class RequestStore { // 申請（ExpenseRequest）に関する「読み取り・作成・状態遷移」をまとめたサービス的クラス（Controllerから呼ばれる想定）。
	private final ExpenseRequestMapper expenseRequestMapper; // DBアクセス（MyBatis Mapper）を担当する依存先。SQLの実行はここに委譲します。

	private final UserMapper userMapper;
	
	public List<RequestSummaryResponse> list() { // 申請一覧（サマリ）を取得するメソッド。
		return expenseRequestMapper.selectRequestSummaries(); // Mapperのselectでサマリ一覧を取り出し、そのまま返します。
	}

	@Transactional // このメソッド内のDB操作を1トランザクションとして扱う（途中で例外ならロールバックする）。
	public RequestSummaryResponse create(Long applicantUserId, String title, int amount, String note) { // 申請を新規作成し、作成結果のサマリを返す。
		String status = "DRAFT"; // 作成直後の状態をDRAFT（下書き）に固定する（初期状態）。

		ExpenseRequest entity = new ExpenseRequest(); // DBにINSERTするためのエンティティ（1申請）を新しく作る。
		entity.setApplicantId(applicantUserId); // 申請者のユーザーIDをセットする。
		entity.setCurrentApproverId(null); // 作成時点では承認者が未確定（または未割当）なのでnullを入れる。
		entity.setTitle(title); // 申請タイトルをセットする（入力値）。
		entity.setAmount(amount); // 金額をセットする（入力値）。
		entity.setStatus(status); // ステータスをDRAFTにセットする（上で定義した初期状態）。
		entity.setNote(note); // 備考をセットする（入力値）。

		expenseRequestMapper.insertExpenseRequest(entity); // INSERTを実行する（MyBatisの設定により、採番されたIDがentityに反映される想定）。

		Long newId = entity.getId(); // INSERT後に採番された主キーID（DBの数値ID）を取り出す。
		String externalId = "REQ-" + String.format("%03d", newId); // 画面やAPIで扱う外部IDを作る（例: REQ-001）。%03dは3桁ゼロ埋め。

		return new RequestSummaryResponse(externalId, title, amount, status, note); // 作成した申請のサマリDTOを組み立てて返す（DBから再取得せず入力値と生成IDで返している）。
	}

	public RequestSummaryResponse findById(String externalId) { // 外部ID（REQ-001形式）から申請のサマリを1件取得する。
		Long id = parseExternalId(externalId); // 外部ID文字列をDBの数値IDに変換する（失敗ならnull）。
		if (id == null) { // 変換に失敗した場合（形式不正など）。
			return null; // 見つからない扱いとしてnullを返す（Controller側で404等に変換する想定）。
		}

		ExpenseRequest found = expenseRequestMapper.selectExpenseRequestById(id); // 数値IDで申請エンティティを1件取得する。
		if (found == null) { // DBに該当データが存在しない場合。
			return null; // 見つからない扱いでnullを返す。
		}

		String reqId = "REQ-" + String.format("%03d", found.getId()); // 取得したエンティティのIDから外部ID文字列を再構築する。
		String note = found.getNote() != null ? found.getNote() : ""; // noteがnullなら空文字にする（レスポンス側でnullを避けたい意図）。

		return new RequestSummaryResponse(reqId, found.getTitle(), found.getAmount(), found.getStatus(), note); // 取得結果からサマリDTOを作って返す。
	}

	public List<InboxItemResponse> inbox(Long approverUserId) { // 承認者ユーザーIDに紐づくInbox（承認待ち一覧など）を取得する。
		List<InboxItemResponse> items = expenseRequestMapper.selectInboxItems(approverUserId); // MapperでInbox用のDTO一覧を取得する。
		return items != null ? items : new ArrayList<>(); // nullが返ってきた場合に備えて、必ず空リストを返す（呼び出し側のnullチェックを不要にする）。
	}

	@Transactional // 状態更新（UPDATE）を行うのでトランザクション境界を張る。
	public boolean submit(Long userId, String externalId) { // 申請者が提出する（DRAFT→SUBMITTEDなど）処理。成功ならtrue。
		Long id = parseExternalId(externalId); // 外部ID（REQ-001）をDBの数値IDへ変換して、DB更新に使える形へ整えます。
		if (id == null) { // 外部IDが不正で数値IDに変換できない場合は、対象が特定できない状態です。
			return false; // 対象不明のため更新せず、失敗としてfalseを返します。
		}
		User applicant = userMapper.findById(userId); // submitした本人（申請者）を users から取得して、上長（承認者）の決定に使います。
		if (applicant == null) { // セッションのuserIdがusersに存在しない場合は、前提が崩れている状態です。
			return false; // 承認者を決められないため、更新せずfalseを返します（Controller側は404扱いになります）。
		}
		Long approverUserId = applicant.getManagerId(); // 申請者の上長ID（manager_id）を承認者として採用し、current_approver_idにセットするために取り出します。
		if (approverUserId == null) { // manager_id が未設定だと承認者が決められず、Inboxに出せない状態になります。
			return false; // 承認者未設定のままSUBMITTEDにすると破綻しやすいので、ここで止めてfalseにします。
		}
		int updated = expenseRequestMapper.updateStatusForApplicant(id, userId, approverUserId, "SUBMITTED"); // 申請者本人の申請を、DRAFT→SUBMITTEDにしつつ承認者IDも同時にセットします。
		return updated == 1; // 更新が1件だけ成功した場合のみtrueとし、0件の場合は条件不一致（権限/状態など）としてfalseにします。
	}

	@Transactional // 状態更新（UPDATE）を行うのでトランザクション境界を張る。
	public boolean approve(Long userId, String externalId) { // 承認者が承認する（SUBMITTED→APPROVEDなど）処理。成功ならtrue。
		Long id = parseExternalId(externalId); // 外部IDを数値IDに変換する。
		if (id == null) { // 変換できない（形式不正）。
			return false; // 失敗扱いでfalse。
		}
		int updated = expenseRequestMapper.updateStatusForApprover(id, userId, "APPROVED"); // 承認者本人が処理できる申請だけを対象にAPPROVEDへ更新し、更新件数を受け取る。
		return updated == 1; // 1件更新なら成功、そうでなければ失敗。
	}

	@Transactional // 状態更新（UPDATE）を行うのでトランザクション境界を張る。
	public boolean returnRequest(Long userId, String externalId) { // 承認者が差戻しする（SUBMITTED→RETURNEDなど）処理。成功ならtrue。
		Long id = parseExternalId(externalId); // 外部IDを数値IDに変換する。
		if (id == null) { // 変換できない（形式不正）。
			return false; // 失敗扱いでfalse。
		}
		int updated = expenseRequestMapper.updateStatusForApprover(id, userId, "RETURNED"); // 承認者本人が処理できる申請だけを対象にRETURNEDへ更新し、更新件数を受け取る。
		return updated == 1; // 1件更新なら成功、そうでなければ失敗。
	}

	private Long parseExternalId(String externalId) { // 外部ID（例: REQ-001）をDBの数値ID（例: 1）に変換するヘルパー。
		if (externalId == null) { // 引数がnullなら変換不能。
			return null; // 変換失敗としてnullを返す。
		}
		if (!externalId.startsWith("REQ-")) { // "REQ-"で始まらないなら想定フォーマットではない。
			return null; // 変換失敗としてnullを返す。
		}
		String numPart = externalId.substring("REQ-".length()); // "REQ-"の後ろ（数値部分）だけを切り出す（例: "001"）。
		try { // 数値変換が失敗する可能性があるので例外処理を用意する。
			return Long.valueOf(numPart); // 数値部分をLongに変換して返す（例: "001" -> 1）。
		} catch (NumberFormatException e) { // 数字でない文字が混ざっていた場合などに発生する例外。
			return null; // 変換失敗としてnullを返す。
		}
	}

}
