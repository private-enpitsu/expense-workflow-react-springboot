/*
 users テーブルへアクセスする MyBatis Mapper インターフェースを定義し、ログイン（findByEmail）と /api/me 判定（findById）に使う
*/

package com.example.expenseworkflow.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.expenseworkflow.domain.User;

//users テーブル用の最小Mapper
@Mapper
public interface UserMapper {
	User findByEmail(@Param("email") String email); // email で users を1件取得する（ログイン照合に使う）
	User findById(@Param("id") Long id); // id で users を1件取得する（/api/me 判定に使う）
}
