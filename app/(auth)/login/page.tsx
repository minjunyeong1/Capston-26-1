"use client";

import styled from "styled-components";
import Link from "next/link";

// 화면 중앙 정렬을 위한 컨테이너
const AuthWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 80px);
  background-color: #f8f9fa;
  padding: 20px;
`;

// 로그인 박스
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

// 입력 폼 스타일
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

// 로그인 버튼
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

export default function LoginPage() {
  return (
    <AuthWrapper>
      <AuthBox>
        <Title>로그인</Title>
        <form>
          <InputGroup>
            <Label>이메일 주소</Label>
            <Input type="email" placeholder="example@email.com" />
          </InputGroup>
          <InputGroup>
            <Label>비밀번호</Label>
            <Input type="password" placeholder="비밀번호를 입력하세요" />
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