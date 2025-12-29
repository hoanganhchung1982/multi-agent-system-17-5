import { Subject, AgentType } from "../types";

// XÓA BỎ phần import GoogleGenAI và API Key cũ đi cho nhẹ đầu

// Hàm xử lý chính: Gọi vào Backend "giả" của bạn thay vì gọi Google
export const callAgent = async (agent: AgentType, subject: Subject, input: string, image?: string) => {
  try {
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agent, subject, input, image })
    });

    const data = await response.json();

    // Tùy theo Agent nào đang gọi mà trả về đoạn text tương ứng
    if (agent === AgentType.SPEED) return data.answer;
    if (agent === AgentType.SOCRATIC) return data.hint;
    if (agent === AgentType.PERPLEXITY) return data.practice;
    
    return data.answer;
  } catch (error) {
    return "Hệ thống đang bảo trì, vui lòng thử lại sau!";
  }
};

// Hàm tóm tắt cho nút Loa
export const getBriefSummary = async (fullAnswer: string) => {
  try {
    const response = await fetch('/api/gemini', { method: 'POST' });
    const data = await response.json();
    return data.summary;
  } catch {
    return "Đây là mấu chốt của bài toán.";
  }
};

// Giữ lại hàm nén ảnh để app không bị lỗi cấu trúc
export const optimizeImage = async (base64Str: string): Promise<string> => {
  return base64Str; // Trả về trực tiếp cho nhanh trong bản tối giản
};
