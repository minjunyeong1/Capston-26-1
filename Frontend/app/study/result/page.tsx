"use client";

import styled from "styled-components";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { studyApi } from "@/app/_lib/api/studyApi";

// ==========================================
// 1. 스타일 컴포넌트 영역
// ==========================================
const PageWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 160px);
  background-color: #f5f7fb;
  padding: 40px;
`;

const ContentContainer = styled.div`
  display: flex;
  width: 100%;
  max-width: 1000px;
  gap: 30px;

  @media (max-width: 1024px) {
    flex-direction: column;
  }
`;

const LeftSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column; /* 단일 카드이므로 꽉 차게 변경 */
  gap: 20px;
`;

const RightSection = styled.div`
  flex: 1.2;
`;

const Card = styled.div`
  background-color: #ffffff;
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  box-shadow: 4px 4px 0px rgba(0, 0, 0, 0.05);
  padding: 40px 20px; 
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  min-width: 220px;
`;

const CardTitle = styled.h3`
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin: 0 0 30px 0;
  text-align: center;
  width: 100%;
  word-break: keep-all;
  line-height: 1.4;
`;

const FormCard = styled.div`
  background-color: #ffffff;
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  box-shadow: 4px 4px 0px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0;
  overflow: hidden;
  height: 100%;
`;

const FormHeader = styled.div`
  width: 100%;
  padding: 20px;
  background-color: #f8fafc;
  border-bottom: 2px solid #e2e8f0;
  text-align: center;
  font-size: 20px;
  font-weight: bold;
  color: #333;
`;

const FormBody = styled.div`
  width: 100%;
  padding: 40px;
  display: flex;
  flex-direction: column;
  gap: 40px;
  box-sizing: border-box;
  flex: 1;
  justify-content: space-between;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const Label = styled.label`
  font-size: 18px;
  font-weight: bold;
  color: #333;
`;

const UnderlineInput = styled.input`
  width: 100%;
  border: none;
  border-bottom: 2px solid #cbd5e1;
  font-size: 16px;
  padding: 10px 0;
  outline: none;
  background: transparent;
  color: #333;

  &:focus {
    border-bottom-color: #6366f1;
  }
`;

const Slider = styled.input`
  width: 100%;
  height: 8px;
  border-radius: 4px;
  background: #e2e8f0;
  outline: none;
  -webkit-appearance: none;
  cursor: pointer;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #6366f1;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }
`;

const SaveButton = styled.button`
  align-self: flex-end;
  background-color: #111;
  color: white;
  padding: 14px 30px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 20px;

  &:hover {
    background-color: #333;
  }
  
  &:disabled {
    background-color: #94a3b8;
    cursor: not-allowed;
  }
`;

const radius = 70;
const strokeWidth = 18;
const circumference = 2 * Math.PI * radius;

// ==========================================
// 2. 메인 컴포넌트
// ==========================================
export default function StudyResultPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id") || "";
  
  const [score, setScore] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  const [achievement, setAchievement] = useState<number>(50);
  const [memo, setMemo] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      setIsLoading(false);
      return;
    }

    studyApi.endSession(sessionId)
      .then((data) => {
        setScore(data.focus_score);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("결과 불러오기 실패:", err);
        setIsLoading(false);
      });
  }, [sessionId]);

  const strokeDashoffset = circumference - (score / 100) * circumference;

  const handleSave = async () => {
    if (!memo.trim()) {
      return alert("오늘의 메모를 작성해주세요!");
    }
    if (!sessionId) return alert("세션 ID를 찾을 수 없습니다.");

    setIsSaving(true);
    try {
      await studyApi.saveSessionResult(sessionId, achievement, memo);
      alert("오늘의 공부 기록이 저장되었습니다! 고생하셨습니다 🎉");
      router.push("/mypage"); 
    } catch (err) {
      console.error(err);
      alert("저장 중 오류가 발생했습니다.");
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <PageWrapper>결과를 분석 중입니다...</PageWrapper>;
  }

  return (
    <PageWrapper>
      <ContentContainer>
        
        <LeftSection>
          <Card>
            <CardTitle>최종 집중도 점수</CardTitle>
            <div style={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "center", height: "260px", width: "100%" }}>
              <svg width="180" height="180" viewBox="0 0 180 180">
                <circle cx="90" cy="90" r={radius} stroke="#f1f5f9" strokeWidth={strokeWidth} fill="none" />
                <circle
                  cx="90" cy="90" r={radius}
                  stroke="#64748b" strokeWidth={strokeWidth} fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  style={{ transition: "stroke-dashoffset 1.5s ease-in-out", transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
                />
              </svg>
              <div style={{ position: "absolute", fontSize: "32px", fontWeight: "bold", color: "#333" }}>
                {score}%
              </div>
            </div>
          </Card>
        </LeftSection>

        <RightSection>
          <FormCard>
            <FormHeader>오늘의 공부</FormHeader>
            <FormBody>
              
              <div>
                <InputGroup style={{ marginBottom: '40px' }}>
                  <Label style={{ display: "flex", justifyContent: "space-between", marginBottom: '10px' }}>
                    <span>오늘 목표를 얼마나 달성했나요?</span>
                    <span style={{ color: "#6366f1", fontSize: "24px" }}>{achievement}%</span>
                  </Label>
                  <Slider 
                    type="range" 
                    min="0" 
                    max="100" 
                    step="5"
                    value={achievement}
                    onChange={(e) => setAchievement(Number(e.target.value))}
                  />
                </InputGroup>

                <InputGroup>
                  <Label style={{ marginBottom: '10px' }}>오늘의 메모</Label>
                  <UnderlineInput 
                    type="text" 
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                    placeholder="예: 상태 관리가 조금 헷갈렸다. 내일 복습 필수!" 
                  />
                </InputGroup>
              </div>

              <SaveButton onClick={handleSave} disabled={isSaving}>
                {isSaving ? "저장 중..." : "기록 저장하고 메인으로"}
              </SaveButton>
            </FormBody>
          </FormCard>
        </RightSection>

      </ContentContainer>
    </PageWrapper>
  );
}