"use client";

import styled from "styled-components";
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell // 🌟 원형 차트를 위한 컴포넌트들 추가 수입
} from "recharts";

// 하얀색 카드 모양의 컨테이너
const Card = styled.div`
  background-color: white;
  padding: 30px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin-bottom: 30px;
`;

// 카드 안의 작은 제목
const CardTitle = styled.h3`
  font-size: 18px;
  color: #333;
  margin-bottom: 20px;
  font-weight: bold;
`;

// 🌟 [추가] 하단 통계창들을 가로로 배치하기 위한 그리드
const ChartGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr; /* 3칸으로 쪼개기 */
  gap: 30px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr 1fr; /* 태블릿은 2칸 */
  }
  @media (max-width: 768px) {
    grid-template-columns: 1fr; /* 모바일은 1칸으로 세로 배치 */
  }
`;

// 🌟 [추가] 원형 차트 가운데에 글씨를 넣기 위한 컨테이너
const DonutContainer = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 250px;
`;

const InnerText = styled.div`
  position: absolute;
  font-size: 28px;
  font-weight: bold;
  color: #556080; /* 진한 회청색 */
`;

// [더미 데이터] 상단 꺾은선 그래프용 // TODO: API 연결 시 수정
const dummyChartData = [
  { name: "1주차", 집중도: 40, 진행도: 24 },
  { name: "2주차", 집중도: 30, 진행도: 13 },
  { name: "3주차", 집중도: 20, 진행도: 58 },
  { name: "4주차", 집중도: 27, 진행도: 39 },
  { name: "5주차", 집중도: 18, 진행도: 48 },
  { name: "6주차", 집중도: 23, 진행도: 38 },
  { name: "7주차", 집중도: 34, 진행도: 43 },
];

// [더미 데이터] 하단 평균 집중도 원형 그래프용 (67% 달성 기준) // TODO: API 연결 시 수정
const averageData = [
  { name: "집중", value: 67 }, 
  { name: "나머지", value: 33 }, 
];
const COLORS = ["#8b95a8", "#f0f2f5"]; // 칠해질 색상(회청색)과 바탕 색상(연회색)

export default function MyPage() {
  return (
    <div>
      {/* 🌟 인사말 <PageTitle> 컴포넌트 제거됨! */}

      {/* 1. 상단 넓은 꺾은선 그래프 */}
      <Card>
        <CardTitle>공부 진행도 및 집중도 추이</CardTitle>
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <AreaChart data={dummyChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#888' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#888' }} dx={-10} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
              <Area type="monotone" dataKey="집중도" stroke="#c084fc" fill="#e9d5ff" strokeWidth={3} />
              <Area type="monotone" dataKey="진행도" stroke="#fb923c" fill="#fed7aa" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* 2. 하단 통계 그리드 (여기에 여러 개의 작은 카드들을 넣을 수 있음) */}
      <ChartGrid>
        {/* 첫 번째 칸: 평균 집중도 도넛 차트 */}
        <Card>
          <CardTitle>평균 집중도</CardTitle>
          <DonutContainer>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={averageData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70} // 도넛 안쪽 구멍 크기
                  outerRadius={90} // 도넛 바깥쪽 크기
                  startAngle={90} // 12시 방향부터 시작
                  endAngle={-270}
                  dataKey="value"
                  stroke="none"
                >
                  {/* 데이터 비율에 맞게 색상 칠해주기 */}
                  {averageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            {/* 도넛 정중앙에 들어갈 텍스트 */}
            <InnerText>67%</InnerText>
          </DonutContainer>
        </Card>
        
        {/* 나중에 두 번째, 세 번째 통계 카드를 여기에 추가하면 예쁘게 정렬됨! */}
      </ChartGrid>
    </div>
  );
}