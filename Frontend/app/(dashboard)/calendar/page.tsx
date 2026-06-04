"use client";

import styled from "styled-components";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // 🌟 useRouter 임포트 필수!
import { calendarApi } from "@/app/_lib/api/studyApi";

// ==========================================
// 1. 스타일 컴포넌트 영역
// ==========================================
const PageWrapper = styled.div`display: flex; flex-direction: column; gap: 20px;`;
const HeaderArea = styled.div`display: flex; justify-content: space-between; align-items: center;`;
const CalendarArea = styled.div`background-color: white; padding: 30px; border-radius: 16px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);`;
const CalendarHeader = styled.div`display: flex; justify-content: center; align-items: center; gap: 20px; margin-bottom: 30px;`;
const MonthTitle = styled.h2`font-size: 24px; font-weight: bold; color: #333; margin: 0;`;
const NavButton = styled.button`background: none; border: none; font-size: 18px; cursor: pointer; color: #666; &:hover { color: #2196f3; font-weight: bold; }`;
const DayNames = styled.div`display: grid; grid-template-columns: repeat(7, 1fr); text-align: center; font-weight: bold; color: #888; margin-bottom: 10px;`;
const CalendarGrid = styled.div`display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px;`;

const DayCell = styled.div<{ $isCurrentMonth: boolean; $isToday: boolean }>`
  min-height: 120px; padding: 8px; border-radius: 8px;
  border: 1px solid ${(props) => (props.$isToday ? "#2196f3" : "#f0f0f0")};
  background-color: ${(props) => (props.$isToday ? "#f0f8ff" : "white")};
  opacity: ${(props) => (props.$isCurrentMonth ? 1 : 0.3)};
  cursor: pointer; display: flex; flex-direction: column; gap: 4px;
  position: relative; 
  &:hover { border-color: #2196f3; }
`;

const DayHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e2e8f0; 
  padding-bottom: 6px;
  margin-bottom: 4px;
`;

const DayNumber = styled.span`
  font-weight: bold; 
  font-size: 14px; 
  color: #333; 
`;

const StatusBadge = styled.div<{ $isSuccess: boolean }>`
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background-color: ${(props) => (props.$isSuccess ? "#4caf50" : "#f44336")};
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 10px; 
  font-weight: bold;
  cursor: ${(props) => (props.$isSuccess ? "pointer" : "default")};
  z-index: 10;

  &:hover {
    transform: ${(props) => (props.$isSuccess ? "scale(1.15)" : "none")};
    transition: transform 0.2s;
  }
`;

const EventBadge = styled.div<{ $color?: string }>`
  font-size: 11px; color: white; 
  background-color: ${(props) => props.$color || "#2196f3"}; 
  padding: 4px 6px; border-radius: 4px;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
`;

const ModalOverlay = styled.div`position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0, 0, 0, 0.4); display: flex; justify-content: center; align-items: center; z-index: 1000;`;
const ModalContent = styled.div`background-color: white; border-radius: 16px; width: 400px; max-width: 90%; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2); overflow: hidden; display: flex; flex-direction: column;`;
const ModalBody = styled.div`padding: 20px; display: flex; flex-direction: column; gap: 20px; max-height: 70vh; overflow-y: auto;`;
const TitleInput = styled.input`font-size: 20px; font-weight: bold; border: none; border-bottom: 2px solid transparent; padding: 5px 0; outline: none; width: 100%; &::placeholder { color: #bbb; } &:focus { border-bottom: 2px solid #2196f3; }`;
const Row = styled.div`display: flex; justify-content: space-between; align-items: center; font-size: 15px; color: #333;`;
const ToggleSwitch = styled.div<{ $isOn: boolean }>`width: 44px; height: 24px; background-color: ${(props) => (props.$isOn ? "#2196f3" : "#ddd")}; border-radius: 12px; position: relative; cursor: pointer; transition: background-color 0.2s; &::after { content: ''; position: absolute; top: 2px; left: ${(props) => (props.$isOn ? "22px" : "2px")}; width: 20px; height: 20px; background-color: white; border-radius: 50%; transition: left 0.2s; }`;
const DateTimeGroup = styled.div`display: flex; gap: 10px; flex: 1; justify-content: flex-end;`;
const DTInput = styled.input`border: none; background-color: #f5f6f8; padding: 8px 10px; border-radius: 8px; font-size: 14px; outline: none; &:focus { background-color: #e3f2fd; color: #1976d2; }`;
const ClickableRow = styled(Row)`cursor: pointer; padding: 10px 0; &:hover { opacity: 0.7; }`;
const ModalFooter = styled.div`display: flex; border-top: 1px solid #eee;`;
const FooterBtn = styled.button<{ $isPrimary?: boolean; $isDanger?: boolean }>`flex: 1; padding: 16px; background: white; border: none; font-size: 16px; cursor: pointer; font-weight: ${(props) => (props.$isPrimary ? "bold" : "normal")}; color: ${(props) => (props.$isDanger ? "#f44336" : props.$isPrimary ? "#2196f3" : "#666")}; &:hover { background-color: #f9f9f9; } &:not(:last-child) { border-right: 1px solid #eee; }`;
const RepeatOption = styled.div<{ $isActive: boolean }>`padding: 15px; font-size: 15px; cursor: pointer; display: flex; justify-content: space-between; color: ${(props) => (props.$isActive ? "#2196f3" : "#333")}; background-color: ${(props) => (props.$isActive ? "#f0f8ff" : "white")}; border-bottom: 1px solid #f0f0f0; &:hover { background-color: #f9f9f9; }`;
const BackHeader = styled.div`padding: 15px 20px; display: flex; align-items: center; border-bottom: 1px solid #eee; font-weight: bold; font-size: 16px; cursor: pointer; justify-content: space-between; &:hover { background-color: #f9f9f9; }`;

const EventListItem = styled.div<{ $color?: string }>`
  padding: 12px; background-color: #f5f6f8; border-radius: 8px; cursor: pointer; 
  border-left: 4px solid ${(props) => props.$color || "#2196f3"}; 
  &:hover { background-color: #e3f2fd; }
`;
const AddEventBtn = styled.button`padding: 12px; background-color: white; border: 1px dashed #bbb; color: #666; border-radius: 8px; cursor: pointer; font-weight: bold; &:hover { background-color: #f9f9f9; border-color: #2196f3; color: #2196f3; }`;

const EVENT_COLORS = ["#2196f3", "#f44336", "#4caf50", "#ff9800", "#9c27b0", "#607d8b"];

const isEventOnDate = (event: any, cellDateStr: string) => {
  if (cellDateStr >= event.startDate && cellDateStr <= event.endDate) return true;
  if (event.repeatType !== "none" && cellDateStr > event.endDate) {
    const d1 = new Date(event.startDate);
    const d2 = new Date(cellDateStr);
    const diffTime = d2.getTime() - d1.getTime();
    const diffDays = Math.round(diffTime / (1000 * 3600 * 24));
    
    if (event.repeatType === "day" && diffDays % event.repeatInterval === 0) return true;
    if (event.repeatType === "week" && diffDays % (7 * event.repeatInterval) === 0) return true;
    if (event.repeatType === "month") {
      const diffMonths = (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth());
      if (diffMonths % event.repeatInterval === 0 && d1.getDate() === d2.getDate()) return true;
    }
    if (event.repeatType === "year") {
      const diffYears = d2.getFullYear() - d1.getFullYear();
      if (diffYears % event.repeatInterval === 0 && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate()) return true;
    }
  }
  return false;
};

// ==========================================
// 2. 메인 컴포넌트
// ==========================================
export default function CalendarPage() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // 🌟 유저 ID를 상태로 관리합니다. (초기값은 빈 문자열)
  const [userId, setUserId] = useState<string>("");

  const [events, setEvents] = useState<any[]>([]);
  const [studyRecords, setStudyRecords] = useState<Record<string, any[]>>({});
  const [nextColorIndex, setNextColorIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalView, setModalView] = useState<"list" | "main" | "repeat" | "recordList" | "recordDetail">("list");
  const [selectedDate, setSelectedDate] = useState("");
  const [dayEventsList, setDayEventsList] = useState<any[]>([]);
  const [dayRecordsList, setDayRecordsList] = useState<any[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [isAllDay, setIsAllDay] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("10:00");
  const [repeatType, setRepeatType] = useState<"none" | "day" | "week" | "month" | "year">("none");
  const [repeatInterval, setRepeatInterval] = useState(1);
  const [currentColor, setCurrentColor] = useState("");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const todayStr = new Date().toISOString().split("T")[0];

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  // 🌟 컴포넌트가 마운트될 때 로그인 여부를 먼저 확인합니다!
  useEffect(() => {
    const storedId = localStorage.getItem("user_id");
    if (!storedId) {
      alert("로그인이 필요한 서비스입니다.");
      router.push("/auth/login");
    } else {
      setUserId(storedId); // 로그인이 되어있다면 상태에 저장
    }
  }, [router]);

  // 🌟 로그인된 userId가 설정된 이후에 데이터를 불러옵니다.
  const loadData = async () => {
    if (!userId) return; // userId가 없으면 실행 안 함

    try {
      const scheduleData = await calendarApi.getSchedules(userId);
      setEvents(scheduleData);
      setNextColorIndex(scheduleData.length % EVENT_COLORS.length); 
    } catch (error) {
      console.error("일정 불러오기 에러:", error);
    }

    try {
      const recordsData = await calendarApi.getSessionResults(userId);
      const recordsMap: Record<string, any[]> = {};
      
      recordsData.forEach((session: any) => {
        if (!session.start_time) return; 

        const dateStr = session.start_time.split(/[T ]/)[0]; 
        
        if (!recordsMap[dateStr]) recordsMap[dateStr] = [];
        recordsMap[dateStr].push(session);
      });
      
      setStudyRecords(recordsMap);
    } catch (error) {
      console.warn("백엔드 공부 기록 API 호출 실패");
    }
  };

  // userId가 바뀔 때마다 데이터를 새로 불러옵니다.
  useEffect(() => {
    loadData();
  }, [userId]);

  const handleDayClick = (day: number | null) => {
    if (!day) return;
    const formattedDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    setSelectedDate(formattedDate);

    const targetEvents = events.filter(e => isEventOnDate(e, formattedDate));
    
    if (targetEvents.length > 0) {
      setDayEventsList(targetEvents);
      setModalView("list");
    } else {
      prepareNewEventForm(formattedDate);
    }
    setIsModalOpen(true);
  };

  const handleBadgeClick = (e: React.MouseEvent, dateStr: string) => {
    e.stopPropagation(); 
    
    setSelectedDate(dateStr);
    const records = studyRecords[dateStr] || [];
    
    if (records.length === 0) return; 

    setDayRecordsList(records);
    
    if (records.length === 1) {
      setSelectedRecord(records[0]);
      setModalView("recordDetail");
    } else {
      setModalView("recordList");
    }
    setIsModalOpen(true);
  };

  const prepareNewEventForm = (dateStr: string) => {
    setEditingId(null);
    setTitle(""); setIsAllDay(false);
    setStartDate(dateStr); setEndDate(dateStr);
    setStartTime("09:00"); setEndTime("10:00");
    setRepeatType("none"); setRepeatInterval(1);
    setCurrentColor(EVENT_COLORS[nextColorIndex]); 
    setModalView("main");
  };

  const handleEditEvent = (eventData: any) => {
    setEditingId(eventData.id);
    setTitle(eventData.title); setIsAllDay(eventData.isAllDay);
    setStartDate(eventData.startDate); setEndDate(eventData.endDate);
    setStartTime(eventData.startTime); setEndTime(eventData.endTime);
    setRepeatType(eventData.repeatType); setRepeatInterval(eventData.repeatInterval);
    setCurrentColor(eventData.color);
    setModalView("main");
  };

  const handleSave = async () => {
    if (!userId) return;

    const scheduleData = {
      title: title || "새 일정",
      isAllDay, startDate, endDate, startTime, endTime, repeatType, repeatInterval, color: currentColor
    };

    try {
      if (editingId) {
        await calendarApi.updateSchedule(editingId, scheduleData);
      } else {
        await calendarApi.createSchedule(userId, scheduleData); // 🌟 userId 사용
      }
      setIsModalOpen(false);
      loadData(); 
    } catch (error) {
      console.error("일정 저장 에러:", error);
      alert("일정 저장에 실패했습니다.");
    }
  };

  const handleDelete = async () => {
    if (!editingId) return;
    if (window.confirm("이 일정을 삭제하시겠습니까?")) {
      try {
        await calendarApi.deleteSchedule(editingId);
        setIsModalOpen(false);
        loadData(); 
      } catch (error) {
        console.error("일정 삭제 에러:", error);
        alert("일정 삭제에 실패했습니다.");
      }
    }
  };

  const getRepeatText = () => {
    if (repeatType === "none") return "반복 안 함";
    const unit = { day: "일", week: "주", month: "달", year: "년" }[repeatType];
    return `${repeatInterval}${unit}마다`;
  };

  return (
    <PageWrapper>
      <HeaderArea>
        <h1 style={{ margin: 0, fontSize: "24px", color: "#333" }}>학습 달력</h1>
      </HeaderArea>

      <CalendarArea>
        <CalendarHeader>
          <NavButton onClick={() => setCurrentDate(new Date(year, month - 1, 1))}>◀</NavButton>
          <MonthTitle>{year}년 {month + 1}월</MonthTitle>
          <NavButton onClick={() => setCurrentDate(new Date(year, month + 1, 1))}>▶</NavButton>
        </CalendarHeader>

        <DayNames>
          <span style={{ color: "#f44336" }}>일</span><span>월</span><span>화</span><span>수</span><span>목</span><span>금</span><span style={{ color: "#2196f3" }}>토</span>
        </DayNames>

        <CalendarGrid>
          {days.map((day, index) => {
            const formattedDate = day ? `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}` : "";
            const currentDayEvents = day ? events.filter(e => isEventOnDate(e, formattedDate)) : [];
            
            const dailyRecords = day ? (studyRecords[formattedDate] || []) : [];
            const recordCount = dailyRecords.length;
            const isPastOrToday = day ? (formattedDate <= todayStr) : false;

            return (
              <DayCell 
                key={index} 
                $isCurrentMonth={day !== null}
                $isToday={formattedDate === todayStr}
                onClick={() => handleDayClick(day)}
              >
                {day && (
                  <DayHeader>
                    <DayNumber>{day}</DayNumber>
                    
                    {isPastOrToday && (
                      <StatusBadge 
                        $isSuccess={recordCount > 0}
                        onClick={(e) => {
                          if (recordCount > 0) handleBadgeClick(e, formattedDate);
                        }}
                      >
                        {recordCount >= 2 ? recordCount : ""}
                      </StatusBadge>
                    )}
                  </DayHeader>
                )}

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {currentDayEvents.map(event => (
                    <EventBadge key={event.id} $color={event.color}>{event.title}</EventBadge>
                  ))}
                </div>
              </DayCell>
            );
          })}
        </CalendarGrid>
      </CalendarArea>

      {isModalOpen && (
        <ModalOverlay onClick={() => setIsModalOpen(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            
            {modalView === "recordList" && (
              <>
                <BackHeader onClick={() => setIsModalOpen(false)}>
                  <span>📅 {selectedDate} 공부 기록</span>
                  <span style={{color: '#888', fontWeight: 'normal'}}>✖</span>
                </BackHeader>
                <ModalBody>
                  {dayRecordsList.map((record, idx) => {
                    const startTime = record.start_time.split("T")[1].substring(0, 5);
                    return (
                      <EventListItem 
                        key={idx} 
                        $color="#4caf50" 
                        onClick={() => { setSelectedRecord(record); setModalView("recordDetail"); }}
                      >
                        <div style={{ fontWeight: 'bold', marginBottom: '6px', fontSize: '15px' }}>
                          📖 {record.subject} 공부
                        </div>
                        <div style={{ fontSize: '13px', color: '#666', display: 'flex', justifyContent: 'space-between' }}>
                          <span>시작: {startTime}</span>
                          <span>집중도: {record.focus_percentage}%</span>
                        </div>
                      </EventListItem>
                    );
                  })}
                </ModalBody>
              </>
            )}

            {modalView === "recordDetail" && selectedRecord && (
              <>
                <BackHeader onClick={() => {
                  if (dayRecordsList.length > 1) setModalView("recordList");
                  else setIsModalOpen(false);
                }}>
                  {dayRecordsList.length > 1 ? "◀ 목록으로" : "◀ 닫기"}
                </BackHeader>
                <ModalBody style={{ gap: '20px' }}>
                  <div style={{ fontSize: '22px', fontWeight: 'bold', textAlign: 'center', margin: '10px 0' }}>
                    {selectedRecord.subject} 공부 완료! 🎉
                  </div>

                  <Row>
                    <span style={{ color: '#888', fontWeight: 'bold' }}>집중도 점수</span>
                    <span style={{ color: '#4caf50', fontSize: '20px', fontWeight: 'bold' }}>
                      {selectedRecord.focus_percentage}%
                    </span>
                  </Row>

                  <Row>
                    <span style={{ color: '#888', fontWeight: 'bold' }}>진행도 (달성도)</span>
                    <span style={{ color: '#2196f3', fontSize: '20px', fontWeight: 'bold' }}>         
                      {selectedRecord.achievement_percentage || 0}%
                    </span>
                  </Row>

                  <div style={{ marginTop: '10px' }}>
                    <div style={{ color: '#888', fontWeight: 'bold', marginBottom: '8px' }}>오늘의 메모</div>
                    <div style={{ 
                      padding: '16px', 
                      backgroundColor: '#f8fafc', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px', 
                      fontSize: '15px',
                      color: '#333',
                      lineHeight: '1.5'
                    }}>
                      {selectedRecord.memo || "작성된 메모가 없습니다."}
                    </div>
                  </div>
                </ModalBody>
              </>
            )}

            {modalView === "list" && (
              <>
                <BackHeader onClick={() => setIsModalOpen(false)}>
                  <span>📅 {selectedDate} 일정</span>
                  <span style={{color: '#888', fontWeight: 'normal'}}>✖</span>
                </BackHeader>
                <ModalBody>
                  {dayEventsList.map(event => (
                    <EventListItem key={event.id} $color={event.color} onClick={() => handleEditEvent(event)}>
                      <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{event.title}</div>
                      <div style={{ fontSize: '13px', color: '#666' }}>
                        {event.isAllDay ? "하루 종일" : `${event.startTime} ~ ${event.endTime}`}
                        {event.repeatType !== 'none' && ` 🔁`}
                      </div>
                    </EventListItem>
                  ))}
                  <AddEventBtn onClick={() => prepareNewEventForm(selectedDate)}>+ 새 일정 추가</AddEventBtn>
                </ModalBody>
              </>
            )}

            {modalView === "main" && (
              <>
                {dayEventsList.length > 0 && editingId && (
                  <BackHeader onClick={() => setModalView("list")}>◀ 목록으로</BackHeader>
                )}
                <ModalBody>
                  <TitleInput 
                    type="text" placeholder="제목 (메모) 입력" 
                    value={title} onChange={(e) => setTitle(e.target.value)} autoFocus
                  />

                  <Row>
                    <span>하루 종일</span>
                    <ToggleSwitch $isOn={isAllDay} onClick={() => setIsAllDay(!isAllDay)} />
                  </Row>

                  <Row>
                    <span style={{ width: "40px", color: "#888" }}>시작</span>
                    <DateTimeGroup>
                      <DTInput type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                      {!isAllDay && <DTInput type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />}
                    </DateTimeGroup>
                  </Row>

                  <Row>
                    <span style={{ width: "40px", color: "#888" }}>종료</span>
                    <DateTimeGroup>
                      <DTInput type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                      {!isAllDay && <DTInput type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />}
                    </DateTimeGroup>
                  </Row>

                  <ClickableRow onClick={() => setModalView("repeat")}>
                    <span>반복</span>
                    <span style={{ color: "#2196f3" }}>{getRepeatText()} ➔</span>
                  </ClickableRow>
                </ModalBody>

                <ModalFooter>
                  {editingId ? (
                    <FooterBtn $isDanger onClick={handleDelete}>삭제</FooterBtn>
                  ) : (
                    <FooterBtn onClick={() => setIsModalOpen(false)}>취소</FooterBtn>
                  )}
                  <FooterBtn $isPrimary onClick={handleSave}>저장</FooterBtn>
                </ModalFooter>
              </>
            )}

            {modalView === "repeat" && (
              <>
                <BackHeader onClick={() => setModalView("main")}>◀ 뒤로</BackHeader>
                <div style={{ paddingBottom: "10px" }}>
                  <RepeatOption $isActive={repeatType === "none"} onClick={() => { setRepeatType("none"); setModalView("main"); }}>
                    반복 안 함 {repeatType === "none" && "✔"}
                  </RepeatOption>
                  <RepeatOption $isActive={repeatType === "day"} onClick={() => setRepeatType("day")}>매일 {repeatType === "day" && "✔"}</RepeatOption>
                  <RepeatOption $isActive={repeatType === "week"} onClick={() => setRepeatType("week")}>매주 {repeatType === "week" && "✔"}</RepeatOption>
                  <RepeatOption $isActive={repeatType === "month"} onClick={() => setRepeatType("month")}>매월 {repeatType === "month" && "✔"}</RepeatOption>
                  <RepeatOption $isActive={repeatType === "year"} onClick={() => setRepeatType("year")}>매년 {repeatType === "year" && "✔"}</RepeatOption>
                </div>

                {repeatType !== "none" && (
                  <ModalBody style={{ borderTop: "1px solid #eee", paddingTop: "20px" }}>
                    <Row>
                      <span>반복 주기 설정</span>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <DTInput type="number" min="1" value={repeatInterval} onChange={(e) => setRepeatInterval(Number(e.target.value))} style={{ width: "60px", textAlign: "right" }} />
                        <span>{repeatType === "day" && "일"}{repeatType === "week" && "주"}{repeatType === "month" && "달"}{repeatType === "year" && "년"} 마다</span>
                      </div>
                    </Row>
                  </ModalBody>
                )}
              </>
            )}

          </ModalContent>
        </ModalOverlay>
      )}
    </PageWrapper>
  );
}