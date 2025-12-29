// File: api/gemini.ts
// Backend này đã được tối giản hóa: KHÔNG CẦN API KEY, KHÔNG LỖI 405
export const config = {
  runtime: 'edge', 
};

export default async function handler(req: Request) {
  // 1. Chấp nhận yêu cầu POST từ Frontend
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: "Chỉ chấp nhận lệnh POST" }), { status: 405 });
  }

  // 2. Giả lập dữ liệu trả về (Bạn không cần sửa gì ở đây)
  const mockResponse = {
    speed: {
      answer: "Để giải bài toán này, ta áp dụng công thức: $A = \pi \cdot r^2$. Kết quả cuối cùng là 25.12.",
      similar: {
        question: "Câu hỏi tương tự: Tính chu vi hình chữ nhật có cạnh 3 và 4?",
        options: ["7", "12", "14", "10"],
        correctIndex: 2
      }
    },
    socratic_hint: "Gợi ý: Hãy kiểm tra kỹ đơn vị đo lường trước khi tính toán nhé!",
    core_concept: "Hình học và Đại số cơ bản"
  };

  // 3. Trả về kết quả cho Frontend ngay lập tức
  return new Response(JSON.stringify(mockResponse), {
    status: 200,
    headers: { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*' // Cho phép mọi nguồn truy cập để tránh lỗi CORS
    }
  });
}
