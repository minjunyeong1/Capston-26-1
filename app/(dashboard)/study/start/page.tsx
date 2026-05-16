"use client";

import styled from "styled-components";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

// ==========================================
// 1. 스타일 컴포넌트 영역 (✨ 업그레이드된 디자인)
// ==========================================
const PageWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: calc(100vh - 160px);
  background-color: #f5f7fb; /* 약간 차가운 톤의 밝은 회색 배경으로 변경 */
`;

const ContentContainer = styled.div`
  display: flex;
  width: 100%;
  max-width: 1100px;
  background-color: white; /* 🌟 하얀색 카드로 전체를 감싸서 콘텐츠 집중도 상승 */
  padding: 60px 80px;
  border-radius: 30px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.04); /* 부드럽고 깊은 그림자 */
  gap: 80px;

  @media (max-width: 1024px) {
    flex-direction: column;
    padding: 40px;
    gap: 50px;
  }
`;

/* ===== 왼쪽: 시간 입력 영역 ===== */
const LeftSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-right: 1px solid #f0f0f0; /* 양쪽을 구분하는 은은한 선 추가 */
  padding-right: 40px;

  @media (max-width: 1024px) {
    border-right: none;
    border-bottom: 1px solid #f0f0f0;
    padding-right: 0;
    padding-bottom: 40px;
  }
`;

const TimeLabel = styled.h3`
  font-size: 18px;
  color: #888;
  margin-bottom: 30px;
  font-weight: 500;
  letter-spacing: 1px;
`;

const TimeInputWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const TimeBox = styled.input`
  width: 90px;
  height: 110px;
  border: 2px solid #eef0f5;
  border-radius: 20px;
  font-size: 48px;
  font-weight: 700;
  color: #333;
  text-align: center;
  outline: none;
  background: #fcfcfd;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.02);

  /* ✨ 포커스 시 테두리 색상 변화 및 살짝 떠오르는 효과 */
  &:focus {
    border-color: #6366f1; /* 트렌디한 인디고(보라+파랑) 색상 */
    background: white;
    transform: translateY(-4px);
    box-shadow: 0 10px 20px rgba(99, 102, 241, 0.15);
  }

  &::placeholder {
    color: #ddd;
    font-weight: 400;
  }

  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    -webkit-appearance: none; margin: 0;
  }
`;

const Colon = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 0 10px;
  
  /* : 모양을 동그라미 두 개로 예쁘게 구현 */
  &::before, &::after {
    content: '';
    width: 10px;
    height: 10px;
    background-color: #cbd5e1;
    border-radius: 50%;
  }
`;

const TimeHint = styled.div`
  display: flex;
  justify-content: space-between;
  width: 220px;
  margin-top: 15px;
  font-size: 14px;
  color: #a0aec0;
  font-weight: 500;
  padding: 0 20px;
`;

/* ===== 오른쪽: 입력 폼 & 버튼 영역 ===== */
const RightSection = styled.div`
  flex: 1.2; /* 입력창 부분이 살짝 더 넓게 */
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 45px;
  padding-left: 20px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: relative;
`;

const Label = styled.label`
  font-size: 15px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const UnderlineInput = styled.input`
  width: 100%;
  border: none;
  border-bottom: 2px solid #e2e8f0;
  font-size: 22px;
  font-weight: 500;
  color: #1e293b;
  padding: 12px 0;
  outline: none;
  background: transparent;
  transition: border-color 0.3s;

  &:focus {
    border-bottom-color: #6366f1; /* 인디고 포인트 컬러 */
  }
  
  &::placeholder {
    color: #cbd5e1;
    font-weight: 400;
  }
`;


const StartButton = styled.button`
  align-self: flex-start; /* 좌측 정렬로 변경해서 입력 흐름을 자연스럽게 */
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: white;
  padding: 18px 45px;
  border: none;
  border-radius: 14px;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 20px;
  box-shadow: 0 10px 20px rgba(99, 102, 241, 0.3);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 10px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 15px 25px rgba(99, 102, 241, 0.4);
  }

  &:active {
    transform: translateY(1px);
    box-shadow: 0 5px 10px rgba(99, 102, 241, 0.3);
  }
`;


// ==========================================
// 2. 메인 컴포넌트
// ==========================================
export default function StudyStartPage() {
  const router = useRouter();

  const [timeValues, setTimeValues] = useState(["", "", "", ""]);
  const [topic, setTopic] = useState("");
  const [goal, setGoal] = useState("");

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // 시간 입력 처리 로직 (이전과 동일)
  const handleTimeChange = (index: number, value: string) => {
    const numValue = value.replace(/[^0-9]/g, "");
    if (!numValue && value !== "") return;
    if (index === 2 && parseInt(numValue) > 5) return;

    const newTimeValues = [...timeValues];
    newTimeValues[index] = numValue.slice(-1); 
    setTimeValues(newTimeValues);

    if (numValue && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && timeValues[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleStartStudy = () => {
    const hours = parseInt(`${timeValues[0] || "0"}${timeValues[1] || "0"}`);
    const minutes = parseInt(`${timeValues[2] || "0"}${timeValues[3] || "0"}`);
    const totalMinutes = hours * 60 + minutes;

    if (totalMinutes === 0) return alert("공부할 시간을 입력해주세요!");
    if (!topic.trim()) return alert("공부 주제를 입력해주세요!");

    // TODO: 백엔드 API 통신
    alert(`${hours}시간 ${minutes}분 동안 '${topic}' 공부를 시작합니다! 🚀`);
    
    // router.push(`/study/timer?time=${totalMinutes}&topic=${topic}`);
  };

  return (
    <PageWrapper>
      <ContentContainer>
        
        {/* === 왼쪽 시간 설정 부분 === */}
        <LeftSection>
          <TimeLabel>목표 집중 시간 설정</TimeLabel>
          <TimeInputWrapper>
            <TimeBox ref={(el) => { inputRefs.current[0] = el; }} value={timeValues[0]} onChange={(e) => handleTimeChange(0, e.target.value)} onKeyDown={(e) => handleKeyDown(0, e)} placeholder="0" />
            <TimeBox ref={(el) => { inputRefs.current[1] = el; }} value={timeValues[1]} onChange={(e) => handleTimeChange(1, e.target.value)} onKeyDown={(e) => handleKeyDown(1, e)} placeholder="0" />
            
            {/* 세련된 콜론(:) 디자인 */}
            <Colon />
            
            <TimeBox ref={(el) => { inputRefs.current[2] = el; }} value={timeValues[2]} onChange={(e) => handleTimeChange(2, e.target.value)} onKeyDown={(e) => handleKeyDown(2, e)} placeholder="0" />
            <TimeBox ref={(el) => { inputRefs.current[3] = el; }} value={timeValues[3]} onChange={(e) => handleTimeChange(3, e.target.value)} onKeyDown={(e) => handleKeyDown(3, e)} placeholder="0" />
          </TimeInputWrapper>
          
          <TimeHint>
            <span>HOURS</span>
            <span>MINUTES</span>
          </TimeHint>
        </LeftSection>

        {/* === 오른쪽 입력 및 버튼 부분 === */}
        <RightSection>
          <InputGroup>
            <Label>공부 주제 (Subject)</Label>
            <UnderlineInput 
              type="text" 
              placeholder="무엇을 공부할 계획인가요?" 
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </InputGroup>

          <InputGroup>
            <Label>오늘의 세부 목표 (Goal)</Label>
            <UnderlineInput 
              type="text" 
              placeholder="예: 3단원 완독 및 요약 정리" 
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
            />
          </InputGroup>

          <StartButton onClick={handleStartStudy}>
            <span></span> 타이머 시작하기
          </StartButton>
        </RightSection>

      </ContentContainer>
    </PageWrapper>
  );
}