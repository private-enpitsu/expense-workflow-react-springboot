package com.example.expenseworkflow.store;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.example.expenseworkflow.controller.dto.InboxItemResponse;
import com.example.expenseworkflow.controller.dto.RequestDetailResponse;
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

	public List<RequestSummaryResponse> listByApplicant(Long applicantUserId) { // 申請者本人の申請だけを一覧として取得するメソッド。
		return expenseRequestMapper.selectRequestSummariesByApplicant(applicantUserId); // applicant_id で絞り込んだサマリ一覧をMapperから取得して返す。
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

		return new RequestSummaryResponse(newId, title, amount, status, note, null); // 作成直後はlastReturnCommentがないのでnullを渡す。
	}

	public RequestSummaryResponse findById(Long id) { // 数値IDから申請のサマリを1件取得する。
		if (id == null) { // 引数がnullなら取得不能。
			return null; // 見つからない扱いとしてnullを返す（Controller側で404等に変換する想定）。
		}

		ExpenseRequest found = expenseRequestMapper.selectExpenseRequestById(id); // 数値IDで申請エンティティを1件取得する。
		if (found == null) { // DBに該当データが存在しない場合。
			return null; // 見つからない扱いでnullを返す。
		}

		String note = found.getNote() != null ? found.getNote() : ""; // noteがnullなら空文字にする（レスポンス側でnullを避けたい意図）。

		return new RequestSummaryResponse(found.getId(), found.getTitle(), found.getAmount(), found.getStatus(), note, found.getLastReturnComment()); // lastReturnCommentをエンティティから取り出して渡す。
	}

	public RequestSummaryResponse findByIdForApplicant(Long applicantUserId, Long id) { // 申請者本人の申請だけを数値IDで取得する。
		if (id == null) { // 引数がnullなら取得不能。
			return null; // 見つからない扱いとしてnullを返す（Controller側で404等に変換する想定）。
		}

		ExpenseRequest found = expenseRequestMapper.selectExpenseRequestByIdAndApplicant(id, applicantUserId); // id と applicant_id の両方で1件取得し、他人の申請は見えないようにする。
		if (found == null) { // DBに該当データが存在しない場合、または申請者が一致しない場合。
			return null; // 見つからない扱いでnullを返す（他人の申請も404相当として隠す）。
		}

		String note = found.getNote() != null ? found.getNote() : ""; // noteがnullなら空文字にする（レスポンス側でnullを避けたい意図）。

		return new RequestSummaryResponse(found.getId(), found.getTitle(), found.getAmount(), found.getStatus(), note, found.getLastReturnComment()); // lastReturnCommentをエンティティから取り出して渡す。
	}

	public List<InboxItemResponse> inbox(Long approverUserId) { // 承認者ユーザーIDに紐づくInbox（承認待ち一覧など）を取得する。
		List<InboxItemResponse> items = expenseRequestMapper.selectInboxItems(approverUserId); // MapperでInbox用のDTO一覧を取得する。
		return items != null ? items : new ArrayList<>(); // nullが返ってきた場合に備えて、必ず空リストを返す（呼び出し側のnullチェックを不要にする）。
	}

	public RequestDetailResponse findByIdForApprover(Long approverUserId, Long id) { // 承認者本人が担当する申請を詳細取得する。
		if (id == null) {
			return null;
		}
		ExpenseRequest found = expenseRequestMapper.selectExpenseRequestByIdAndApprover(id, approverUserId); // id と current_approver_id の両方で1件取得し、他人のInbox申請は見えないようにする。
		if (found == null) {
			return null;
		}
		String note = found.getNote() != null ? found.getNote() : "";
		return new RequestDetailResponse(
			found.getId(),
			found.getTitle(),
			found.getAmount(),
			found.getStatus(),
			note,
			java.util.Collections.emptyList(), // actionsは現フェーズでは空配列で返す
			found.getLastReturnComment() // lastReturnCommentをエンティティから取り出して渡す
		);
	}

	@Transactional // 状態更新（UPDATE）を行うのでトランザクション境界を張る。
	public boolean submit(Long userId, Long id) { // 申請者が提出する（DRAFT→SUBMITTED）処理。成功ならtrue。
		if (id == null) { // 引数がnullなら対象が特定できない状態。
			return false; // 対象不明のため更新せず、失敗としてfalseを返す。
		}
		User applicant = userMapper.findById(userId); // submitした本人（申請者）を users から取得して、上長（承認者）の決定に使います。
		if (applicant == null) { // セッションのuserIdがusersに存在しない場合は、前提が崩れている状態です。
			return false; // 承認者を決められないため、更新せずfalseを返します（Controller側は404扱いになります）。
		}
		Long approverUserId = applicant.getManagerId(); // 申請者の上長ID（manager_id）を承認者として採用し、current_approver_idにセットするために取り出します。
		if (approverUserId == null) { // manager_id が未設定だと承認者が決められず、Inboxに出せない状態になります。
			throw new org.springframework.web.server.ResponseStatusException( // controllerに「クライアント起因の不正(400)」として返させる例外を投げます。
				org.springframework.http.HttpStatus.BAD_REQUEST, // HTTP 400 Bad Request を指定して「submit禁止」をHTTPで表現します。
				"Cannot submit because your manager_id is NULL (approver is not configured)." // 禁止理由をメッセージとして返し、404(対象なし)と区別できるようにします。
			); // ResponseStatusException の生成をここで閉じます。
		}
		int updated = expenseRequestMapper.updateStatusForApplicant(id, userId, approverUserId, "SUBMITTED"); // 申請者本人の申請を、DRAFT→SUBMITTEDにしつつ承認者IDも同時にセットします。
		return updated == 1; // 更新が1件だけ成功した場合のみtrueとし、0件の場合は条件不一致（権限/状態など）としてfalseにします。
	}

	@Transactional // 状態更新（UPDATE）を行うのでトランザクション境界を張る。
	public boolean approve(Long userId, Long id) { // 承認者が承認する（SUBMITTED→APPROVED）処理。成功ならtrue。
		if (id == null) { // 引数がnullなら対象が特定できない。
			return false; // 失敗扱いでfalse。
		}
		int updated = expenseRequestMapper.updateStatusForApprover(id, userId, "APPROVED"); // 承認者本人が処理できる申請だけを対象にAPPROVEDへ更新し、更新件数を受け取る。
		return updated == 1; // 1件更新なら成功、そうでなければ失敗。
	}

	@Transactional // 状態更新（UPDATE）と履歴INSERTを同一トランザクションにするために境界を張る。
	public boolean returnRequest(Long userId, Long id, String comment) { // 承認者が差戻しし、コメントを履歴へ記録する処理。成功ならtrue。
		if (id == null) { // 引数がnullなら対象が特定できない。
			return false; // 失敗扱いでfalseを返す。
		}

		ExpenseRequest current = expenseRequestMapper.selectExpenseRequestById(id); // 現在の申請状態を取得し、差戻し可能条件とfrom_status決定に使う。
		if (current == null) { // 対象申請が存在しない場合の分岐をする。
			return false; // 見つからない扱いでfalseを返す。
		} // 存在チェック分岐を閉じる

		Long currentApproverId = current.getCurrentApproverId(); // 現在の承認者IDを取り出し、操作権限の判定に使う。
		if (currentApproverId == null || !currentApproverId.equals(userId)) { // セッションの承認者と一致しない場合の分岐をする。
			return false; // 他人の申請は差戻しできないためfalseを返す。
		} // 承認者一致チェック分岐を閉じる

		String fromStatus = current.getStatus(); // 履歴に残すfrom_statusとして、更新前のstatusを保持する。
		if (fromStatus == null || !"SUBMITTED".equals(fromStatus)) { // SUBMITTED以外は差戻し不可にして、想定外の状態遷移を防ぐ。
			return false; // 差戻し不可としてfalseを返す。
		} // 状態チェック分岐を閉じる

		String toStatus = "RETURNED"; // 遷移後ステータスをRETURNEDに固定する。
		int updated = expenseRequestMapper.updateStatusForApproverWithComment(id, userId, toStatus, comment); // 差戻し専用UPDATEでstatus/last_return_comment/last_returned_atを同時に更新する。
		if (updated != 1) { // 更新件数が1以外の場合の分岐をする。
			return false; // 更新できなかった扱いでfalseを返す。
		} // 更新件数分岐を閉じる

		String action = "RETURN"; // actionsテーブルに残す操作名をRETURNに固定する（差戻し操作であることを判別できるようにする）。
		expenseRequestMapper.insertExpenseRequestAction(id, userId, action, fromStatus, toStatus, comment); // 差戻し履歴を1行INSERTしてコメントをSOTとして保存する。
		return true; // status更新と履歴INSERTが完了したため成功としてtrueを返す。
	} // returnRequest を閉じる
	
	@Transactional
	public boolean withdraw(Long applicantUserId, Long id) { // 申請者が申請を取り下げる（DRAFT/RETURNED→WITHDRAWN）処理。成功ならtrue。
		if (id == null) return false;
		int updated = expenseRequestMapper
				.updateStatusToWithdrawn(id, applicantUserId);
		return updated == 1;
	}

	@Transactional
	public boolean reject(Long approverUserId, Long id) { // 承認者が申請を却下する（SUBMITTED→REJECTED）処理。成功ならtrue。
		if (id == null) return false;
		int updated = expenseRequestMapper
				.updateStatusToRejected(id, approverUserId);
		return updated == 1;
	}
	
	@Transactional // 内容更新（UPDATE）を行うのでトランザクション境界を張る。
	public boolean updateReturned(Long applicantUserId, Long id, String title, int amount, String note) { // 申請者が差戻し（RETURNED）申請の内容を編集して保存する。
		if (id == null) { // 引数がnullなら対象が特定できない。
			return false; // 対象が特定できないため、更新せず失敗としてfalseを返す。
		}
		int updated = expenseRequestMapper.updateEditableFieldsForApplicant(id, applicantUserId, title, amount, note); // 申請者本人かつRETURNEDの申請だけを対象に、編集可能項目（title/amount/note）を更新する。
		return updated == 1; // 更新が1件だけ成功した場合のみtrueとし、0件の場合は条件不一致（権限/状態など）としてfalseにする。
	}


}
