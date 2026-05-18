"use client";

import styled, { keyframes } from "styled-components";
import { useState, useEffect } from "react";
import Image from "next/image";

// 메인 화면 전체를 감싸는 가장 큰 틀 (PC에선 좌우, 모바일에선 상하 배치)
const HeroSection = styled.main`
  display: flex;
  flex-direction: row;
  min-height: calc(100vh - 80px);
  padding: 80px 50px;
  background-color: white;
  gap: 40px;

  @media (max-width: 1024px) {
    padding: 60px 40px;
    gap: 30px;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    padding: 40px 20px;
    gap: 20px;
    min-height: auto;
  }
`;

// 왼쪽 텍스트와 버튼들을 세로로 깔끔하게 묶어주는 공간
const TextContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

// 화면에 가장 크게 띄워질 메인 제목 글씨
const MainTitle = styled.h1`
  font-size: 40px;
  font-weight: bold;
  line-height: 1.4;
  color: #333;
  margin: 0 0 20px 0;

  @media (max-width: 1024px) font-size: 32px;
  @media (max-width: 768px) font-size: 28px;
`;

// 사용자가 클릭할 '게스트 모드 시작' 버튼 모양
const CtaButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 20px;
  background-color: #2196f3;
  color: white;
  font-size: 14px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  margin-top: 15px;
  width: fit-content;

  &:hover { background-color: #1976d2; }

  @media (max-width: 768px) {
    width: 100%;
    padding: 12px 20px;
  }
`;

// 사진과 글씨가 나타날 때 스르륵 보여지게 하는 투명도/위치 이동 효과
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

// 오른쪽에서 5초마다 변하는 캐러셀 전체를 감싸는 회색 배경 박스
const ImagePlaceholder = styled.div`
  flex: 1;
  background-color: #f0f2f5;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #666;
  position: relative;
  overflow: hidden;

  @media (max-width: 768px) {
    padding: 20px;
    min-height: 350px;
  }
`;

// 캐러셀 안에서 사진, 제목, 설명을 하나로 묶어 애니메이션을 적용받는 세트
const CarouselItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  width: 100%;
  height: 100%;
  animation: ${fadeIn} 0.6s ease-out;
`;

// 캐러셀 안에 들어가는 실제 이미지가 담길 고정된 크기의 네모 상자
const CarouselImage = styled.div`
  width: 100%;
  max-width: 250px;
  height: 250px;
  position: relative;
  margin-bottom: 25px;

  @media (max-width: 768px) {
    max-width: 180px;
    height: 180px;
    margin-bottom: 15px;
  }
`;

// 캐러셀 이미지 바로 밑에 들어갈 굵은 소제목 글씨
const CarouselTitle = styled.h3`
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin: 0 0 10px 0;
`;

// 소제목 밑에 들어갈 얇은 설명 글씨
const CarouselDescription = styled.p`
  font-size: 14px;
  line-height: 1.6;
  color: #666;
  margin: 0;
`;

// 캐러셀 화면에 번갈아가며 띄워줄 데이터 목록
const carouselData = [
  {
    id: 1,
    imageSrc: "/start_1.png",
    title: "집중도 케어 공부",
    description: "공부를 하며 나의 집중도를 확인해보세요."
  },
  {
    id: 2,
    imageSrc: "/start_2.png",
    title: "직관적인 학습 스케줄러",
    description: "공부 계획을 세우고 진행도를 체크해보세요."
  },
];

// 화면에 최종적으로 그려지는 메인 조립 설명서
export default function Home() {
  // 현재 몇 번째 캐러셀 화면을 보여줄지 기억하는 변수 (처음엔 0번째)
  const [currentIndex, setCurrentIndex] = useState(0);

  // 5초마다 다음 화면으로 넘어가게 해주는 자동 타이머
  useEffect(() => {
    const interval = setInterval(() => {
      // 데이터 개수를 넘어가면 다시 0으로 돌아오게 계산
      setCurrentIndex((prevIndex) => (prevIndex + 1) % carouselData.length);
    }, 5000);

    // 다른 페이지로 이동하면 타이머를 꺼서 메모리 낭비를 막음
    return () => clearInterval(interval);
  }, []);

  // 현재 순서(currentIndex)에 맞는 데이터를 뽑아옴
  const currentData = carouselData[currentIndex];

  return (
    <HeroSection>
      <TextContent>
        <MainTitle>
          AI 에이전트와 공부하며 공부 진행도를<br />
  관리해보세요
        </MainTitle>
        <CtaButton>
          <span>게스트 모드로 바로 시작해보기</span>
          <span>&gt;</span>
        </CtaButton>
      </TextContent>
      
      <ImagePlaceholder>
        <CarouselItem key={currentData.id}>
          <CarouselImage>
            <Image 
              src={currentData.imageSrc} 
              alt={currentData.title}
              fill 
              style={{ objectFit: "contain" }} 
            />
          </CarouselImage>
          <CarouselTitle>{currentData.title}</CarouselTitle>
          <CarouselDescription>{currentData.description}</CarouselDescription>
        </CarouselItem>
      </ImagePlaceholder>
    </HeroSection>
  );
}