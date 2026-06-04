"use client";

import styled from "styled-components";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { studyApi } from "@/app/_lib/api/studyApi"; 

// ==========================================
// 1. 스타일 컴포넌트 영역
// ==========================================
const PageWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: calc(100vh - 160px);
  background-color: #f5f7fb; 
`;

const ContentContainer = styled.div`
  display: flex;
  width: 100%;
  max-width: 1100px;
  background-color: white; 
  padding: 60px 80px;
  border-radius: 30px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.04); 
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
  border-right: 1px solid #f0f0f0; 
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

  &:focus {
    border-color: #6366f1; 
    background: white;
    transform: translateY(-4px);
    box-shadow: 0 10px 20px rgba(99, 102, 241, 0.15);
  }

  &::placeholder {
    color: #ddd;
    font-weight: 400;
  }
`;

const Colon = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 0 10px;
  
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
  flex: 1.2; 
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 40px; 
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

/* 🌟 과목 선택 라디오(체크박스) 컨테이너 */
const SubjectContainer = styled.div`
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  margin-top: 5px;
`;

const SubjectLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 500;
  color: #1e293b;
  cursor: pointer;
  user-select: none;

  input {
    width: 18px;
    height: 18px;
    cursor: pointer;
    accent-color: #6366f1;
  }
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
    border-bottom-color: #6366f1; 
  }
  
  &::placeholder {
    color: #cbd5e1;
    font-weight: 400;
  }
`;

const CheckboxContainer = styled.div`
  display: flex;
  gap: 30px;
  margin-top: -10px;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 500;
  color: #475569;
  cursor: pointer;
  user-select: none;

  input {
    width: 20px;
    height: 20px;
    cursor: pointer;
    accent-color: #6366f1; 
  }
`;

const StartButton = styled.button`
  align-self: flex-start; 
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: white;
  padding: 18px 45px;
  border: none;
  border-radius: 14px;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 10px;
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

  &:disabled {
    background: #cbd5e1;
    cursor: not-allowed;
    box-shadow: none;
    transform: none;
  }
`;

// ==========================================
// 2. 메인 컴포넌트
// ==========================================
export default function StudyStartPage() {
  const router = useRouter();

  const [timeValues, setTimeValues] = useState(["", "", "", ""]);
  
  // 🌟 과목을 체크박스에서 선택하도록 빈 문자열로 초기화
  const [topic, setTopic] = useState("");
  const [goal, setGoal] = useState("");
  
  const [isPhoneAllowed, setIsPhoneAllowed] = useState(false);
  const [isBookAllowed, setIsBookAllowed] = useState(true);
  
  const [isStarting, setIsStarting] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

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

const handleStartStudy = async () => {
  const userId = localStorage.getItem("user_id");

  // 만약 로그인 정보가 없다면 세션을 만들지 못하게 차단하고 로그인창으로 튕겨냅니다.
  if (!userId) {
    alert("로그인 정보가 만료되었습니다. 다시 로그인해주세요.");
    router.push("/auth/login");
    return;
  }

  const hours = parseInt(`${timeValues[0] || "0"}${timeValues[1] || "0"}`);
  const minutes = parseInt(`${timeValues[2] || "0"}${timeValues[3] || "0"}`);
  const totalMinutes = hours * 60 + minutes;

  if (totalMinutes === 0) return alert("공부할 시간을 입력해주세요.");
  if (!topic) return alert("공부 과목을 선택해주세요.");

  setIsStarting(true);

  try {
    // 🌟 [중요] 임시 ID 대신 진짜 로그인된 userId를 백엔드로 보내 세션을 생성합니다!
    const data = await studyApi.startSession(userId, topic, totalMinutes, isPhoneAllowed, isBookAllowed);
    
    const sessionId = data.session_id; 
    router.push(`/study/studying?session_id=${sessionId}&targetTime=${totalMinutes}`);

  } catch (err) {
    console.error(err);
    alert("세션 생성에 실패했습니다.");
    setIsStarting(false);
  }
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
            
            <Colon />
            
            <TimeBox ref={(el) => { inputRefs.current[2] = el; }} value={timeValues[2]} onChange={(e) => handleTimeChange(2, e.target.value)} onKeyDown={(e) => handleKeyDown(2, e)} placeholder="0" />
            <TimeBox ref={(el) => { inputRefs.current[3] = el; }} value={timeValues[3]} onChange={(e) => handleTimeChange(3, e.target.value)} onKeyDown={(e) => handleKeyDown(3, e)} placeholder="0" />
          </TimeInputWrapper>
          
          <TimeHint>
            <span>HOURS</span>
            <span>MINUTES</span>
          </TimeHint>
        </LeftSection>

        <RightSection>
          <InputGroup>
            <Label>공부 과목 (Subject)</Label>
            <SubjectContainer>
              {["MATH", "THINK", "MEM", "LANG"].map((subjectOption) => (
                <SubjectLabel key={subjectOption}>
                  <input 
                    type="radio" 
                    name="subject" 
                    value={subjectOption}
                    checked={topic === subjectOption}
                    onChange={(e) => setTopic(e.target.value)}
                  />
                  {subjectOption}
                </SubjectLabel>
              ))}
            </SubjectContainer>
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

          {/* 🌟 이모티콘 제거된 체크박스 */}
          <CheckboxContainer>
            <CheckboxLabel>
              <input 
                type="checkbox" 
                checked={isPhoneAllowed} 
                onChange={(e) => setIsPhoneAllowed(e.target.checked)} 
              />
              핸드폰 사용 허용
            </CheckboxLabel>
            
            <CheckboxLabel>
              <input 
                type="checkbox" 
                checked={isBookAllowed} 
                onChange={(e) => setIsBookAllowed(e.target.checked)} 
              />
              책/인쇄물 사용 허용
            </CheckboxLabel>
          </CheckboxContainer>

          <StartButton onClick={handleStartStudy} disabled={isStarting}>
            {isStarting ? "타이머 준비 중..." : "타이머 시작하기"}
          </StartButton>
        </RightSection>

      </ContentContainer>
    </PageWrapper>
  );
}