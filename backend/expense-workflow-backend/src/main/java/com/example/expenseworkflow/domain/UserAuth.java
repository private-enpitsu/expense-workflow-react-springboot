// [目的] users から取得する「認証に必要な最小情報（passwordHash含む）」を保持するための型を提供する // ファイルの役割
// [呼び出し元/使用箇所] UserMapper.selectAuthByEmail の戻り値として使われ、AuthController が照合に利用する // どこから使われるか
// [入力と出力] 入力=DB取得結果 / 出力=getterで参照できるJavaオブジェクト // 入出力
// [依存／前提] MyBatisが setter によりフィールドへ値を詰める前提（カラムはSQLのASで camelCase に寄せる） // 依存と前提


package com.example.expenseworkflow.domain;

import lombok.Data;

@Data // アクセッサ
public class UserAuth { // 認証に必要なユーザー情報を保持するクラス
	
	private Long id; // users.id を保持する
	private String email; // users.email を保持する
	private String passwordHash; // users.password_hash を camelCase で保持する
	private String role; // users.role を保持する（例: APPLICANT/APPROVER/ADMIN）

}
// getId終わり
