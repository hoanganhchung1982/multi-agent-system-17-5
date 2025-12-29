// File: api/gemini.ts
export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  // Dữ liệu giả lập cho từng Agent và chức năng
  const mockData = {
    // Kết quả cho SPEED Agent (dạng JSON như App.tsx yêu cầu)
    speedAnswer: JSON.stringify({
      finalAnswer: "Kết quả bài toán là $x = 5$. Ta có phương trình: $2x + 10 = 20 \\Rightarrow 2x = 10 \\Rightarrow x = 5$.",
      casioSteps: "Bấm: [MENU] [9] [1] [2]\nNhập: 2 [=] 10 [=] 20 [=]\nKết quả hiện x = 5."
    }),
    // Kết quả cho các Agent khác
    socraticHint: "Mấu chốt nằm ở việc bạn cần chuyển vế và đổi dấu các hạng tử tự do trước.",
    perplexityPractice: "Bài tập tương tự: Giải phương trình $3x - 15 = 0$.",
    // Dữ liệu cho Quiz
    quiz: {
      question: "Giải phương trình $x^2 - 9 = 0$?",
      options: ["x = 3", "x = -3", "x = 3 hoặc x = -3", "Vô nghiệm"],
      answer: "C"
    },
    // Tóm tắt cho Loa
    summary: "Nghiệm của phương trình là giá trị làm cho hai vế bằng nhau."
  };

  return new Response(JSON.stringify(mockData), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
