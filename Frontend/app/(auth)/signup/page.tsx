"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import Link from "next/link";
import { studyApi } from "@/app/_lib/api/studyApi"; // 🌟 API 연동

// --- 스타일 컴포넌트 ---
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
  margin-bottom: 15px;
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
  margin-top: 15px;

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

// 🌟 에러 메시지 표시를 위한 스타일 추가
const ErrorText = styled.p`
  color: #e53935;
  font-size: 14px;
  margin-bottom: 15px;
  text-align: center;
`;

// --- 메인 컴포넌트 ---
export default function SignupPage() {
  const router = useRouter();

  // 🌟 폼 데이터 상태 관리
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault(); // 기본 폼 전송 방지
    setErrorMessage("");

    // 1. 비밀번호 일치 여부 확인
    if (password !== passwordConfirm) {
      setErrorMessage("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      // 2. 백엔드 API 호출 (studyApi.ts에 정의해둔 signup 함수 사용)
      await studyApi.signup(email, username, password);
      
      // 3. 성공 시 안내 후 로그인 페이지로 이동
      alert("회원가입이 완료되었습니다! 로그인해주세요.");
      router.push("/login");
      
    } catch (error) {
      console.error(error);
      setErrorMessage("회원가입에 실패했습니다. 이메일이나 이름이 중복되었을 수 있습니다.");
    }
  };

  return (
    <AuthWrapper>
      <AuthBox>
        <Title>회원가입</Title>
        
        {/* 에러 메시지가 있을 경우 출력 */}
        {errorMessage && <ErrorText>{errorMessage}</ErrorText>}

        <form onSubmit={handleSignup}>
          <InputGroup>
            <Label>이름 (닉네임)</Label>
            <Input 
              type="text" 
              placeholder="이름을 입력하세요" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </InputGroup>
          <InputGroup>
            <Label>이메일 주소</Label>
            <Input 
              type="email" 
              placeholder="example@email.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </InputGroup>
          <InputGroup>
            <Label>비밀번호</Label>
            <Input 
              type="password" 
              placeholder="8자 이상의 비밀번호" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </InputGroup>
          <InputGroup>
            <Label>비밀번호 확인</Label>
            <Input 
              type="password" 
              placeholder="비밀번호를 다시 입력하세요" 
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              required
            />
          </InputGroup>
          <SubmitButton type="submit">가입 완료</SubmitButton>
        </form>
        
        <BottomText>
          이미 계정이 있으신가요? 
          <Link href="/login">로그인</Link>
        </BottomText>
      </AuthBox>
    </AuthWrapper>
  );
}