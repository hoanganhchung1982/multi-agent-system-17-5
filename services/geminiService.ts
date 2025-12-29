// File: api/gemini.ts
export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  // Giả lập dữ liệu cho cả 3 Agent (Speed, Socratic, Perplexity)
  const mockData = {
    answer: "Kết quả bài toán là $x = 5$. Ta có $2x + 10 = 20 \\Rightarrow 2x = 10 \\Rightarrow x = 5$.",
    hint: "Gợi ý: Hãy chuyển các số hạng tự do sang vế phải và đổi dấu.",
    practice: "Bài tập tương tự: Giải phương trình $3x - 15 = 0$. Đáp án: $x = 5$.",
    summary: "Nghiệm của phương trình bậc nhất là giá trị làm vế trái bằng vế phải."
  };

  return new Response(JSON.stringify(mockData), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
