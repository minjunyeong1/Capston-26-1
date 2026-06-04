"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import Link from "next/link";
import { studyApi } from "@/app/_lib/api/studyApi"; // 경로가 다르면 알맞게 수정해주세요

// --- 스타일 컴포넌트 (기존과 동일) ---
const AuthWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 80px);
  background-color: #f8f9fa;
  padding: 20px;
`;

const AuthBox = styled.div`
  width: 100%;
  max-width: 400px;
  background-color: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 30px;
  text-align: center;
`;

const InputGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  box-sizing: border-box;
  
  &:focus {
    border-color: #2196f3;
    outline: none;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 14px;
  background-color: #2196f3;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 10px;

  &:hover {
    background-color: #1976d2;
  }
`;

const BottomText = styled.p`
  margin-top: 20px;
  font-size: 14px;
  color: #888;
  text-align: center;

  a {
    color: #2196f3;
    text-decoration: none;
    font-weight: bold;
    margin-left: 5px;
  }
`;

// 에러 메시지를 보여주기 위한 스타일 추가
const ErrorText = styled.p`
  color: #e53935;
  font-size: 14px;
  margin-bottom: 15px;
  text-align: center;
`;

// --- 컴포넌트 로직 ---
export default function LoginPage() {
  const router = useRouter();
  
  // 입력값 및 에러 상태 관리
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // 폼 기본 제출(새로고침) 방지
    setErrorMessage(""); // 기존 에러 초기화

    try {
      const response = await studyApi.login(username, password);
      
      if (response && response.user_id) {
         // 1. 기존: 로컬스토리지에 저장 (클라이언트용)
         localStorage.setItem("user_id", response.user_id);
         
         // 🌟 2. 추가: 쿠키에 저장 (서버 문지기인 미들웨어용!)
         // path=/ 는 사이트 전체에서 이 쿠키를 쓰겠다는 뜻이고, max-age는 86400초(하루) 동안 유지한다는 뜻입니다.
         document.cookie = `user_id=${response.user_id}; path=/; max-age=86400;`;
         
         alert("로그인 성공!");
         
         // 마이페이지나 캘린더로 이동
         router.push("/mypage"); 
      } else {
         setErrorMessage("로그인 응답 형식이 올바르지 않습니다.");
      }
    } catch (err: any) {
      // 로그인 실패 처리
      console.error(err);
      setErrorMessage("아이디 또는 비밀번호가 일치하지 않습니다.");
    }
  };

  return (
    <AuthWrapper>
      <AuthBox>
        <Title>로그인</Title>
        
        {/* 에러가 있을 경우 화면에 표시 */}
        {errorMessage && <ErrorText>{errorMessage}</ErrorText>}
        
        <form onSubmit={handleLogin}>
          <InputGroup>
            <Label>이메일 또는 닉네임</Label>
            <Input 
              type="text" 
              placeholder="example@email.com 또는 닉네임" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </InputGroup>
          <InputGroup>
            <Label>비밀번호</Label>
            <Input 
              type="password" 
              placeholder="비밀번호를 입력하세요" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </InputGroup>
          <SubmitButton type="submit">로그인하기</SubmitButton>
        </form>
        
        <BottomText>
          계정이 없으신가요? 
          <Link href="/signup">회원가입</Link>
        </BottomText>
      </AuthBox>
    </AuthWrapper>
  );
}