"use client";

import styled from "styled-components";
import Link from "next/link";
import { usePathname } from "next/navigation"; 

const DashboardWrapper = styled.div`
  display: flex;
  height: 112vh;
  background-color: #f5f6f8;
`;

const Sidebar = styled.aside`
  width: 250px;
  background-color: white;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  padding: 20px;
`;


const MenuItem = styled(Link)<{ $isActive?: boolean }>`
  padding: 15px;
  margin-bottom: 10px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: bold;
  
  /* 현재 페이지면 회색 반투명 박스 & 파란 글씨, 아니면 투명 배경 & 회색 글씨 */
  background-color: ${(props) => (props.$isActive ? "#f0f2f5" : "transparent")};
  color: ${(props) => (props.$isActive ? "#2196f3" : "#666")};

  &:hover {
    background-color: #f0f2f5;
    color: #2196f3;
  }
`;

const MainArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
`;

const TopHeader = styled.header`
  height: 80px;
  background-color: white;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 0 40px;
  gap: 20px;
`;

const StartStudyButton = styled(Link)`
  background-color: #2196f3;
  color: white;
  padding: 8px 16px; 
  border-radius: 18px; 
  text-decoration: none;
  font-weight: bold;
  font-size: 13px; 

  &:hover {
    background-color: #1976d2;
  }
`;

const ProfileCircle = styled(Link)`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #ccc;
  background-image: url('https://picsum.photos/40'); // TODO: API 연결 시 수정
  background-size: cover;
  cursor: pointer;
  display: block; 
`;

const ContentArea = styled.main`
  padding: 40px;
  flex: 1;
`;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <DashboardWrapper>
      <Sidebar>
        <h2 style={{ marginBottom: "40px", color: "#333" }}>WebbyFrames</h2>
        
    
        <MenuItem href="/mypage" $isActive={pathname === "/mypage"}>마이페이지</MenuItem>
        <MenuItem href="/calendar" $isActive={pathname === "/calendar"}>학습 달력</MenuItem>
        <MenuItem href="/account" $isActive={pathname === "/account"}>계정 정보</MenuItem>
      </Sidebar>
      
      <MainArea>
        <TopHeader>
          <StartStudyButton href="/study/start">공부 시작하기</StartStudyButton>
          <ProfileCircle href="/account" />
        </TopHeader>
        
        <ContentArea>{children}</ContentArea>
      </MainArea>
    </DashboardWrapper>
  );
}