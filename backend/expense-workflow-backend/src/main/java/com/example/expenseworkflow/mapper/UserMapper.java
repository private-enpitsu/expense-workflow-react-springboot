/* // ヘッダ開始コメント
  backend/expense-workflow-backend/src/main/java/com/example/expenseworkflow/mapper/UserMapper.java // ファイルパスコメント
  目的: users テーブルへアクセスする MyBatis Mapper インターフェースを定義し、ログイン（findByEmail）と /api/me 判定（findById）に使う // 役割コメント
  呼び出し元/使用箇所: AuthController が findByEmail を呼ぶ / MeController が findById を呼ぶ / 実装は mapper/UserMapper.xml に置く // 利用箇所コメント
  入力と出力: 入力=email または id / 出力=User（見つからない場合は null） // 入出力コメント
  依存／前提: src/main/resources/mapper/UserMapper.xml が同一 namespace で定義されていること // 前提コメント
*/ // ヘッダ終了コメント

package com.example.expenseworkflow.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.expenseworkflow.domain.User;

@Mapper
public interface UserMapper { // users テーブル用の最小Mapper
	
	User findByEmail(@Param("email") String email); // email で users を1件取得する（ログイン照合に使う）
	User findById(@Param("id") Long id); // id で users を1件取得する（/api/me 判定に使う）

}
