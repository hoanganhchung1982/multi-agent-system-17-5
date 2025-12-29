import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css'; // Quan trọng để hiện khung Crop

import { Subject, AgentType } from '../types';
import { Layout } from '../components/Layout';

// Giả lập dữ liệu hoặc gọi API tùy ý bạn, ở đây tập trung vào UX 3 Tab
const MENU_TYPES = {
  ANSWER: 'Mắt thần',
  GUIDE: 'Gia sư ảo',
  QUIZ: 'Luyện Skill'
};

const App: React.FC = () => {
  const [screen, setScreen] = useState<'HOME' | 'INPUT' | 'CROP' | 'ANALYSIS' | 'DIARY'>('HOME');
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [activeMenu, setActiveMenu] = useState(MENU_TYPES.ANSWER);
  
  // States cho Image & Crop
  const [image, setImage] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<Crop | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const [voiceText, setVoiceText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);

  // --- HÀM ĐỌC TIẾNG VIỆT (KHÔNG CẦN KEY) ---
  const speakVietnamese = (text: string) => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text.replace(/[$#*]/g, '')); // Lọc ký tự lạ
    utterance.lang = 'vi-VN';
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  // --- LOGIC CROP ẢNH ---
  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const initialCrop = centerCrop(
      makeAspectCrop({ unit: '%', width: 90 }, 16 / 9, width, height),
      width,
      height
    );
    setCrop(initialCrop);
  };

  // --- LOGIC NÚT ĐỒNG Ý (SEARCH GOOGLE) ---
  const handleFinalSubmit = () => {
    if (!image && !voiceText) return;
    
    // Nếu có text, mở Google Search
    if (voiceText) {
      window.open(`https://www.google.com/search?q=${encodeURIComponent(voiceText + " giải chi tiết")}`, '_blank');
    } else {
      // Nếu có ảnh, mở Google Images (giống Lens)
      window.open(`https://images.google.com/`, '_blank');
    }
    setScreen('ANALYSIS');
  };

  return (
    <Layout 
      onBack={() => {
        if (screen === 'ANALYSIS' || screen === 'CROP') setScreen('INPUT');
        else if (screen === 'INPUT' || screen === 'DIARY') setScreen('HOME');
      }}
      title={selectedSubject || (screen === 'DIARY' ? 'Nhật ký' : '')}
    >
      {/* MÀN HÌNH CHÍNH (Giữ nguyên giao diện đẹp của bạn) */}
      {screen === 'HOME' && (
        <div className="grid grid-cols-2 gap-4 mt-4 animate-in fade-in zoom-in duration-300">
           {/* ... Giữ nguyên các nút Toán, Lý, Hóa ... */}
           {Object.values(Subject).map(sub => (
             <button 
                key={sub} 
                onClick={() => { setSelectedSubject(sub); setScreen('INPUT'); }}
                className="bg-indigo-600 aspect-square rounded-[2.5rem] flex flex-col items-center justify-center text-white shadow-xl active:scale-95 transition-all"
             >
               <span className="text-lg font-black uppercase">{sub}</span>
               <span className="text-4xl mt-2">{sub === 'Toán' ? '📐' : '⚛️'}</span>
             </button>
           ))}
        </div>
      )}

      {/* MÀN HÌNH NHẬP LIỆU (UX MỚI: CÓ CROP) */}
      {screen === 'INPUT' && (
        <div className="space-y-8 animate-in slide-in-from-bottom-5 duration-500">
          <div className="relative group">
            <div className="w-full aspect-video bg-blue-50/50 rounded-[2.5rem] border-2 border-dashed border-blue-200 flex items-center justify-center overflow-hidden shadow-inner">
              {image ? (
                <div className="flex flex-col items-center">
                   <img src={image} className="h-40 object-contain rounded-xl" />
                   <button onClick={() => setScreen('CROP')} className="mt-2 text-xs font-bold text-blue-600 underline">Cắt lại ảnh ✂️</button>
                </div>
              ) : (
                <p className="text-blue-400 text-sm font-medium px-10 text-center">
                  {voiceText ? `📢: ${voiceText}` : "Chụp ảnh đề bài hoặc nói để bắt đầu..."}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-around items-center bg-white p-6 rounded-[2.5rem] shadow-lg border border-blue-50">
             {/* 4 NÚT CHIẾN LƯỢC CỦA BẠN */}
             <div className="flex flex-col items-center">
                <button onClick={() => {/* Hàm mở cam */}} className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center active:scale-90 transition-all">📸</button>
                <span className="text-[10px] font-bold mt-2 text-slate-500">CAMERA</span>
             </div>
             <div className="flex flex-col items-center">
                <button onClick={() => {/* Hàm chọn file */}} className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center active:scale-90 transition-all">🖼️</button>
                <span className="text-[10px] font-bold mt-2 text-slate-500">ẢNH</span>
             </div>
             <div className="flex flex-col items-center">
                <button onClick={() => {/* Hàm ghi âm */}} className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center active:scale-90 transition-all">🎙️</button>
                <span className="text-[10px] font-bold mt-2 text-slate-500">GIỌNG NÓI</span>
             </div>
             <div className="flex flex-col items-center">
                <button onClick={handleFinalSubmit} className="w-14 h-14 rounded-2xl bg-blue-600 text-white shadow-blue-200 shadow-lg flex items-center justify-center active:scale-90 transition-all">🚀</button>
                <span className="text-[10px] font-black mt-2 text-blue-600">ĐỒNG Ý</span>
             </div>
          </div>
        </div>
      )}

      {/* CHỨC NĂNG CROP GIỐNG GOOGLE LENS */}
      {screen === 'CROP' && image && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col items-center p-4">
          <h3 className="text-white font-bold mb-4">Cắt vùng đề bài ✂️</h3>
          <ReactCrop crop={crop} onChange={c => setCrop(c)} onComplete={c => setCompletedCrop(c)}>
            <img ref={imgRef} src={image} onLoad={onImageLoad} className="max-h-[70vh]" />
          </ReactCrop>
          <div className="flex gap-4 mt-6">
            <button onClick={() => setScreen('INPUT')} className="px-8 py-3 bg-white/10 text-white rounded-full font-bold">Hủy</button>
            <button onClick={() => setScreen('INPUT')} className="px-8 py-3 bg-blue-600 text-white rounded-full font-bold">Xong</button>
          </div>
        </div>
      )}

      {/* MÀN HÌNH KẾT QUẢ 3 MENU */}
      {screen === 'ANALYSIS' && (
        <div className="space-y-4 animate-in fade-in duration-500">
          {/* TAB SELECTOR - UI HẤP DẪN */}
          <div className="flex bg-slate-100 p-1 rounded-2xl">
            {Object.values(MENU_TYPES).map(m => (
              <button 
                key={m}
                onClick={() => setActiveMenu(m)}
                className={`flex-1 py-3 text-[10px] font-black rounded-xl transition-all ${activeMenu === m ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}
              >
                {m}
              </button>
            ))}
          </div>

          {/* KHUNG HIỂN THỊ NỘI DUNG */}
          <div className="bg-white rounded-[2.5rem] p-6 shadow-xl border border-blue-50 min-h-[400px] relative">
            <div className="flex justify-between items-center mb-4">
               <span className="text-[10px] font-black text-blue-300 uppercase tracking-widest">{activeMenu}</span>
               {/* NÚT LOA ĐỌC TIẾNG VIỆT */}
               <button 
                  onClick={() => speakVietnamese("Đây là kết quả mẫu dành cho bạn...")}
                  className={`p-3 rounded-full transition-all ${isSpeaking ? 'bg-rose-500 text-white animate-pulse' : 'bg-blue-50 text-blue-600'}`}
                >
                 {isSpeaking ? '⏹️' : '🔊'}
               </button>
            </div>

            <div className="prose prose-slate">
              {activeMenu === MENU_TYPES.ANSWER && (
                <div className="text-center animate-in zoom-in">
                  <h2 className="text-3xl font-black text-indigo-700">$x = 42$</h2>
                  <p className="text-slate-500 text-sm italic mt-2">Kết quả được tìm thấy nhanh nhất</p>
                </div>
              )}
              {activeMenu === MENU_TYPES.GUIDE && (
                <div className="space-y-4 text-sm animate-in slide-in-from-right-4">
                  <div className="p-3 bg-blue-50 rounded-xl border-l-4 border-blue-600">
                    <p className="font-bold">Bước 1: Phân tích đề</p>
                    <p>Nhận diện các đại lượng đã cho trong ảnh...</p>
                  </div>
                </div>
              )}
              {activeMenu === MENU_TYPES.QUIZ && (
                <div className="space-y-3 animate-in slide-in-from-right-8">
                   <p className="font-bold text-sm">Câu hỏi củng cố:</p>
                   {['A. Đáp án 1', 'B. Đáp án 2', 'C. Đáp án 3'].map(opt => (
                     <button key={opt} className="w-full p-4 text-left border border-slate-100 rounded-2xl hover:bg-indigo-50 transition-all font-medium text-xs">{opt}</button>
                   ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;
