"use client";

import styled from "styled-components";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { calendarApi } from "@/app/_lib/api/studyApi"; 
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell 
} from "recharts";

// ==========================================
// 1. 타입(Type) 인터페이스 정의 (TypeScript 최적화)
// ==========================================
interface StudySession {
  start_time?: string;
  end_time?: string;
  target_duration_minutes?: number;
  focus_percentage?: number;
  achievement_percentage?: number | string;
  intervention_count?: number;
  study_minutes?: number;
}

interface ChartDataPoint {
  name: string;
  집중도: number;
  진행도: number;
}

// ==========================================
// 2. 스타일 컴포넌트 영역
// ==========================================
const Card = styled.div`
  background-color: white;
  padding: 30px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin-bottom: 30px;
  
  /* 🔥 레이아웃 충돌 완벽 방어 */
  width: 100%;
  min-width: 0; 
  overflow: hidden; 
`;

const CardTitle = styled.h3`
  font-size: 18px;
  color: #333;
  margin-bottom: 20px;
  font-weight: bold;
`;

const ChartGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr; 
  gap: 30px;
  
  width: 100%;
  min-width: 0;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr 1fr; 
  }
  @media (max-width: 768px) {
    grid-template-columns: 1fr; 
  }
`;

const DonutContainer = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 250px;
  width: 100%; 
`;

const InnerText = styled.div`
  position: absolute;
  font-size: 28px;
  font-weight: bold;
  color: #556080; 
`;

const COLORS = ["#8b95a8", "#f0f2f5"]; 

// ==========================================
// 3. 메인 컴포넌트 영역
// ==========================================
export default function MyPage() {
  const router = useRouter();

  const [isMounted, setIsMounted] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [avgFocus, setAvgFocus] = useState<number>(0);
  const [interventionsPerHour, setInterventionsPerHour] = useState<number>(0);
  const [totalInterventionsCount, setTotalInterventionsCount] = useState<number>(0);

  // 🌟 [교정] setTimeout 제거 (화면 렌더링 즉시 마운트 처리로 깜빡임 최소화)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const storedId = localStorage.getItem("user_id");
    if (!storedId) {
      alert("로그인이 필요한 서비스입니다.");
      router.push("/auth/login");
    } else {
      setUserId(storedId);
    }
  }, [router]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!userId) return;

      try {
        const sessions = await calendarApi.getSessionResults(userId);
        
        // 🌟 [교정] sessions가 undefined일 경우 빈 배열로 처리하여 크래시(튕김) 완벽 방지
        const validSessions = (sessions || []).filter((s: StudySession) => s.start_time);

        if (validSessions.length === 0) return;

        const dateMap: Record<string, { focusSum: number, achieveSum: number, count: number }> = {};
        let totalFocus = 0;
        let totalInterventions = 0;
        let totalStudyMinutes = 0; 

        validSessions.forEach((s: StudySession) => {
          // start_time이 반드시 있다는 것을 위에서 필터링했으므로 안전함
          const dateStr = s.start_time!.split(/[T ]/)[0]; 
          
          if (!dateMap[dateStr]) dateMap[dateStr] = { focusSum: 0, achieveSum: 0, count: 0 };

          const focus = s.focus_percentage || 0;
          const achieve = Number(s.achievement_percentage) || 0; 

          dateMap[dateStr].focusSum += focus;
          dateMap[dateStr].achieveSum += achieve;
          dateMap[dateStr].count += 1;
          totalFocus += focus;
          
         let durationMinutes = s.study_minutes || 0;

          // 혹시나 에러로 0분 이하가 오더라도 최소 1분으로 보정
          if (durationMinutes <= 0 || isNaN(durationMinutes)) {
            durationMinutes = 1; 
          }
          
          totalStudyMinutes += durationMinutes;

          totalInterventions += s.intervention_count || 0;
        });

        const sortedDates = Object.keys(dateMap).sort();
        const formattedData: ChartDataPoint[] = sortedDates.map(date => {
          const shortDate = date.substring(5).replace("-", "/"); 
          const data = dateMap[date];
          return {
            name: shortDate,
            집중도: Math.round(data.focusSum / data.count), 
            진행도: Math.round(data.achieveSum / data.count) 
          };
        });

        if (formattedData.length === 1) {
          const singleDate = new Date(sortedDates[0]);
          singleDate.setDate(singleDate.getDate() - 1); 
          const prevDate = singleDate.toISOString().split("T")[0].substring(5).replace("-", "/");
          formattedData.unshift({ name: prevDate, 집중도: 0, 진행도: 0 });
        }

        const totalHours = totalStudyMinutes / 60;
        let perHour = 0;
        if (totalHours > 0) {
          perHour = totalInterventions / totalHours;
          
          if (totalStudyMinutes < 10 && perHour > 15) {
            perHour = 12; 
          }
        }

        setChartData(formattedData);
        setAvgFocus(Math.round(totalFocus / validSessions.length)); 
        setInterventionsPerHour(Number(perHour.toFixed(1)));
        setTotalInterventionsCount(Math.round(totalInterventions));

      } catch (error) {
        console.error("대시보드 데이터 로드 실패:", error);
      }
    };

    fetchDashboardData();
  }, [userId]); 

  const averageData = [
    { name: "집중", value: avgFocus }, 
    { name: "나머지", value: Math.max(0, 100 - avgFocus) }, 
  ];

  if (!isMounted) {
    return <div style={{ padding: "40px", textAlign: "center", color: "#666" }}>차트를 불러오는 중입니다...</div>;
  }

  return (
    <div style={{ width: "100%", minWidth: 0, overflowX: "hidden" }}>
      <Card>
        <CardTitle>공부 진행도 및 집중도 추이</CardTitle>
        <div style={{ width: "100%", height: 300 }}>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#888' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#888' }} dx={-10} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Area type="monotone" dataKey="집중도" stroke="#c084fc" fill="#e9d5ff" strokeWidth={3} />
                <Area type="monotone" dataKey="진행도" stroke="#fb923c" fill="#fed7aa" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#999' }}>
              공부 데이터가 누적되면 그래프가 표시됩니다.
            </div>
          )}
        </div>
      </Card>

      <ChartGrid>
        {/* 첫 번째 카드: 평균 집중도 도넛 차트 */}
        <Card>
          <CardTitle>전체 평균 집중도 (현재 접속 ID: {userId})</CardTitle>
          <DonutContainer>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={averageData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70} 
                    outerRadius={90} 
                    startAngle={90} 
                    endAngle={-270}
                    dataKey="value"
                    stroke="none"
                  >
                    {averageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#999' }}>데이터 없음</div>
            )}
            <InnerText>{avgFocus}%</InnerText>
          </DonutContainer>
        </Card>
        
        {/* 두 번째 카드: 시간당 AI 개입 */}
        <Card>
          <CardTitle>시간당 평균 AI 개입</CardTitle>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
            <span style={{ fontSize: '48px', fontWeight: 'bold', color: '#f44336' }}>
              {interventionsPerHour.toFixed(1)}회
            </span>
          </div>
        </Card>

        {/* 세 번째 카드: 총 AI 코치 개입 횟수 */}
        <Card>
          <CardTitle>총 AI 코치 개입 횟수</CardTitle>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
            <span style={{ fontSize: '48px', fontWeight: 'bold', color: '#3f51b5' }}>
              {totalInterventionsCount}회
            </span>
          </div>
        </Card>
      </ChartGrid>
    </div>
  );
}