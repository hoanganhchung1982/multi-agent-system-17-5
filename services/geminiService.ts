// File: src/services/geminiService.ts
import { Subject, AgentType } from "../types";

// 1. Gửi tác vụ xử lý
export const processTask = async (subject: Subject, agent: AgentType, input: string, image?: string) => {
  const res = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ agent, subject, input, image })
  });
  const data = await res.json();
  
  if (agent === AgentType.SPEED) return data.speedAnswer;
  if (agent === AgentType.SOCRATIC) return data.socraticHint;
  return data.perplexityPractice;
};

// 2. Tạo câu hỏi tương tự
export const generateSimilarQuiz = async (answer: string) => {
  const res = await fetch('/api/gemini', { method: 'POST' });
  const data = await res.json();
  return data.quiz;
};

// 3. Tạo tóm tắt
export const generateSummary = async (text: string) => {
  const res = await fetch('/api/gemini', { method: 'POST' });
  const data = await res.json();
  return data.summary;
};

// 4. Giả lập âm thanh (Để nút Loa không bị lỗi)
export const fetchTTSAudio = async (text: string) => {
  return "mock-audio-url"; 
};

export const playStoredAudio = async (url: string, ref: any) => {
  console.log("Đang phát âm thanh giả lập...");
  return new Promise(resolve => setTimeout(resolve, 1000));
};

// 5. Nén ảnh tối giản
export const optimizeImage = async (base64Str: string) => base64Str;
