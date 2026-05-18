"use client";

import styled from "styled-components";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

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
  max-width: 1200px; /* 🌟 1. 전체 너비를 1100px -> 1200px로 넉넉하게 확장 */
  gap: 30px;

  @media (max-width: 1024px) {
    flex-direction: column;
  }
`;

/* 좌측 차트 영역 */
const LeftSection = styled.div`
  flex: 1.2; /* 🌟 2. 왼쪽 영역의 비율을 늘려서 카드들이 숨통이 트이게 함 */
  display: flex;
  gap: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

/* 우측 폼 영역 */
const RightSection = styled.div`
  flex: 1; /* 🌟 3. 오른쪽 영역과 비율 균형을 맞춤 */
`;

const Card = styled.div`
  background-color: #ffffff;
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  box-shadow: 4px 4px 0px rgba(0, 0, 0, 0.05);
  padding: 30px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  min-width: 220px; /* 🌟 4. 카드가 너무 찌그러지지 않도록 최소 너비 보장 */
`;

const CardTitle = styled.h3`
  font-size: 17px;
  font-weight: bold;
  color: #333;
  margin: 0 0 20px 0;
  text-align: center;
  width: 100%;
  word-break: keep-all; /* 🌟 5. '무엇이 집중/력을' 처럼 이상하게 줄바꿈 되는 것 방지 */
  line-height: 1.4;
`;

/* 우측 폼 전용 큼직한 카드 */
const FormCard = styled(Card)`
  align-items: flex-start;
  padding: 0;
  overflow: hidden;
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

  &:hover {
    background-color: #333;
  }
`;

// ==========================================
// 2. 더미 데이터 및 헬퍼 함수
// ==========================================
const distractionData = [
  { subject: '스마트폰', A: 120, fullMark: 150 },
  { subject: '소음', A: 98, fullMark: 150 },
  { subject: '졸음', A: 86, fullMark: 150 },
  { subject: '딴생각', A: 99, fullMark: 150 },
  { subject: '피로', A: 85, fullMark: 150 },
];

const radius = 60;
const strokeWidth = 16;
const circumference = 2 * Math.PI * radius;

// ==========================================
// 3. 메인 컴포넌트
// ==========================================
export default function StudyResultPage() {
  const router = useRouter();
  
  const [achievement, setAchievement] = useState("");
  const [memo, setMemo] = useState("");

  const score = 67; 
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const handleSave = () => {
    if (!achievement.trim() || !memo.trim()) {
      return alert("회고 내용을 모두 작성해주세요!");
    }
    alert("오늘의 공부 기록이 저장되었습니다! 고생하셨습니다 🎉");
    router.push("/mypage");
  };

  return (
    <PageWrapper>
      <ContentContainer>
        
        {/* === 좌측: 통계 차트 영역 === */}
        <LeftSection>
          
          <Card>
            <CardTitle>집중도 점수</CardTitle>
            <div style={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "center", height: "240px", width: "100%" }}>
              <svg width="160" height="160" viewBox="0 0 160 160">
                <circle cx="80" cy="80" r={radius} stroke="#f1f5f9" strokeWidth={strokeWidth} fill="none" />
                <circle
                  cx="80" cy="80" r={radius}
                  stroke="#64748b" strokeWidth={strokeWidth} fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  style={{ transition: "stroke-dashoffset 1s ease-in-out", transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
                />
              </svg>
              <div style={{ position: "absolute", fontSize: "28px", fontWeight: "bold", color: "#333" }}>
                {score}%
              </div>
            </div>
          </Card>

          <Card>
            <CardTitle>무엇이 집중력을 잃게 했나요?</CardTitle>
            <div style={{ width: "100%", height: "240px" }}>
              <ResponsiveContainer width="100%" height="100%">
                {/* 🌟 6. outerRadius를 "50%"로 대폭 줄여서 글씨가 들어갈 바깥쪽 마진을 충분히 확보! */}
                <RadarChart cx="50%" cy="50%" outerRadius="50%" data={distractionData}>
                  <PolarGrid stroke="#e2e8f0" />
                  {/* 글씨 크기를 12로 살짝 줄이고, 너무 굵지 않게 조절 */}
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 12, fontWeight: 600 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                  <Radar name="Distraction" dataKey="A" stroke="#94a3b8" fill="#cbd5e1" fillOpacity={0.6} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </Card>

        </LeftSection>

        {/* === 우측: 회고 작성 폼 영역 === */}
        <RightSection>
          <FormCard>
            <FormHeader>오늘의 공부</FormHeader>
            <FormBody>
              <InputGroup>
                <Label>오늘 목표를 얼마나 달성했나요?</Label>
                <UnderlineInput 
                  type="text" 
                  value={achievement}
                  onChange={(e) => setAchievement(e.target.value)}
                  placeholder="예: 리액트 컴포넌트 3개 중 2개 완성" 
                />
              </InputGroup>

              <InputGroup>
                <Label>오늘의 메모</Label>
                <UnderlineInput 
                  type="text" 
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="예: 상태 관리가 조금 헷갈렸다. 내일 복습 필수!" 
                />
              </InputGroup>

              <SaveButton onClick={handleSave}>
                기록 저장하고 메인으로
              </SaveButton>
            </FormBody>
          </FormCard>
        </RightSection>

      </ContentContainer>
    </PageWrapper>
  );
}