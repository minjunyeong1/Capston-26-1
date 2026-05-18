"use client";

import styled from "styled-components";
import { useState } from "react";

// 스타일 컴포넌트

const PageTitle = styled.h1`
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 30px;
`;

const Card = styled.div`
  background-color: white;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  max-width: 600px; 
`;

const ProfileSection = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 40px;
`;

const BigProfileImage = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-image: url('https://picsum.photos/40'); // TODO: API 연결 시 수정
  background-size: cover;
  background-color: #ccc;
`;

const ProfileEditButton = styled.button`
  padding: 8px 16px;
  background-color: #f0f2f5;
  color: #333;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;

  &:hover {
    background-color: #e4e6e9;
  }
`;

const InputGroup = styled.div`
  margin-bottom: 25px;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: bold;
  color: #555;
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

  /* 이메일처럼 수정 불가능한 칸을 위한 스타일 */
  &:disabled {
    background-color: #f5f6f8;
    color: #888;
    cursor: not-allowed;
  }
`;

const SaveButton = styled.button`
  padding: 12px 24px;
  background-color: #2196f3;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;

  &:hover {
    background-color: #1976d2;
  }
`;

// 메인 컴포넌트

export default function AccountPage() {
  // 사용자의 이름을 관리하는 상태 (초기값은 더미 데이터)
  const [name, setName] = useState("미니"); // TODO: API 연결 시 수정
  const [email] = useState("mini@example.com"); // TODO: API 연결 시 수정

  // 텍스트 박스에 타이핑할 때마다 name 상태를 업데이트하는 함수
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  // 저장 버튼을 눌렀을 때 실행되는 함수
  const handleSave = () => {
    // 나중에 백엔드 API가 완성되면 아래 주석을 풀고 실제 요청을 보내면 됩니다.
    // Nameupdate(name);
    
    alert(`이름이 '${name}'(으)로 변경되었습니다! (현재는 UI 테스트만 가능)`);
  };

  return (
    <div>
      <PageTitle>계정 정보</PageTitle>

      <Card>
        <ProfileSection>
          <BigProfileImage />
          <div>
            <h3 style={{ margin: "0 0 10px 0", color: "#333" }}>{name}</h3>
            <ProfileEditButton>사진 변경</ProfileEditButton>
          </div>
        </ProfileSection>

        <InputGroup>
          <Label>이메일 주소 (변경 불가)</Label>
          <Input type="email" value={email} disabled />
        </InputGroup>

        <InputGroup>
          <Label>이름 (닉네임)</Label>
          <Input 
            type="text" 
            value={name} 
            onChange={handleNameChange} 
            placeholder="새로운 이름을 입력하세요" 
          />
        </InputGroup>

        <InputGroup>
          <Label>새 비밀번호</Label>
          <Input type="password" placeholder="변경할 비밀번호를 입력하세요" />
        </InputGroup>

        <SaveButton onClick={handleSave}>변경 사항 저장</SaveButton>
      </Card>
    </div>
  );
}