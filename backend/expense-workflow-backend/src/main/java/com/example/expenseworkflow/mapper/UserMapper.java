package com.example.expenseworkflow.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.expenseworkflow.domain.User;

@Mapper // MyBatisがこのインターフェースをMapperとして扱うようにする
public interface UserMapper { // usersテーブルへのアクセスを定義するMapper
	
	User findByEmail( @Param("email") String email ); // emailでユーザーを1件取得する（存在しない場合はnull）

}
