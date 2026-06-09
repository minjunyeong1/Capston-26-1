import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Header from "./_components/Header";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "옆자리",
  description: "AI 에이전트와 함께 공부하세요.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={inter.className} style={{ margin: 0, padding: 0, boxSizing: "border-box" }}>
        <Header />
        {children} 
      </body>
    </html>
  );
}
