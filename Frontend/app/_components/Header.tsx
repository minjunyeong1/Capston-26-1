"use client";

import styled from "styled-components";
import Link from "next/link"; 
import { usePathname } from "next/navigation";

// 헤더 전체 영역
const HeaderContainer = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 50px;
  background-color: white;
  border-bottom: 1px solid #e0e0e0;

  @media (max-width: 768px) {
    padding: 15px 20px;
  }
`;


const Logo = styled(Link)`
  font-size: 24px;
  font-weight: bold;
  color: #333;
  text-decoration: none; 
`;

// 버튼들 묶음
const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
`;

const LoginButton = styled(Link)`
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  border: 1px solid #e0e0e0;
  background-color: transparent;
  color: #333;
  text-decoration: none; 
  display: flex; 
  align-items: center;

  &:hover { background-color: #f8f9fa; }
`;


const SignUpButton = styled(Link)`
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  border: none;
  background-color: #2196f3;
  color: white;
  text-decoration: none;
  display: flex;
  align-items: center;

  &:hover { background-color: #1976d2; }
`;

export default function Header() {
  const pathname = usePathname();

  if (pathname !== "/") return null;
  return (
    <HeaderContainer>
      {/* href 속성에 이동할 주소 */}
      <Logo href="/">옆자리</Logo>
      <ButtonGroup>
        <LoginButton href="/login">로그인</LoginButton>
        <SignUpButton href="/signup">회원 가입</SignUpButton>
      </ButtonGroup>
    </HeaderContainer>
  );
}
