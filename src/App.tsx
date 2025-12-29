import React, { useState, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

import { Subject } from '../types';
import { Layout } from '../components/Layout';

const MENU_TYPES = {
  ANSWER: '🎯 Quét ngay',
  GUIDE: '📝 Thông suốt',
  QUIZ: '✏️ Chinh phục'
};

interface DiaryEntry {
  id: string;
  subject: string;
  type: 'IMAGE' | 'VOICE';
  content: string; // Base64 image hoặc text
  time: string;
}

const App: React.FC = () => {
  const [screen, setScreen] = useState<'HOME' | 'INPUT' | 'CROP' | 'ANALYSIS' | 'DIARY'>('HOME');
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [activeMenu, setActiveMenu] = useState(MENU_TYPES.ANSWER);
  const [image, setImage] = useState<string | null>(null);
  const [voiceText, setVoiceText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [crop, setCrop] = useState<Crop>();
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // Quản lý Nhật ký
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);

  // Tải nhật ký từ bộ nhớ khi mở app
  useEffect(() => {
    const saved = localStorage.getItem('study_diary');
    if (saved) setDiaryEntries(JSON.parse(saved));
  }, []);

  // Hàm lưu vào nhật ký
  const saveToDiary = useCallback((type: 'IMAGE' | 'VOICE', content: string) => {
    const newEntry: DiaryEntry = {
      id: Date.now().toString(),
      subject: selectedSubject || 'Chưa rõ',
      type,
      content,
      time: new Date().toLocaleString('vi-VN'),
    };
    const updated = [newEntry, ...diaryEntries];
    setDiaryEntries(updated);
    localStorage.setItem('study_diary', JSON.stringify(updated));
  }, [selectedSubject, diaryEntries]);

  const speakVietnamese = (text: string) => {
    if (isSpeaking) { window.speechSynthesis.cancel(); setIsSpeaking(false); return; }
    const utterance = new SpeechSynthesisUtterance(text.replace(/[$#*]/g, ''));
    utterance.lang = 'vi-VN';
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerCrop(makeAspectCrop({ unit: '%', width: 90 }, 1, width, height), width, height));
  };

  const handleRunAnalysis = () => {
    if (!image && !voiceText) return alert("Dữ liệu trống!");
    // TỰ ĐỘNG LƯU NHẬT KÝ KHI BẤM ĐỒNG Ý
    saveToDiary(image ? 'IMAGE' : 'VOICE', image || voiceText);
    
    if (voiceText) window.open(`https://www.google.com/search?q=${encodeURIComponent(voiceText)}`, '_blank');
    else window.open('https://www.google.com/searchbyimage', '_blank');
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
      {screen === 'HOME' && (
        <div className="grid grid-cols-2 gap-4 mt-4 animate-in fade-in duration-500">
          {[
            { name: Subject.MATH, color: 'bg-indigo-600', icon: '📐' },
            { name: Subject.PHYSICS, color: 'bg-violet-600', icon: '⚛️' },
            { name: Subject.CHEMISTRY, color: 'bg-emerald-600', icon: '🧪' },
            { name: Subject.DIARY, color: 'bg-amber-600', icon: '📔' },
          ].map((sub) => (
            <button key={sub.name} onClick={() => { if (sub.name === Subject.DIARY) setScreen('DIARY'); else { setSelectedSubject(sub.name as Subject); setScreen('INPUT'); } }} className={`${sub.color} aspect-square rounded-[2rem] flex flex-col items-center justify-center text-white shadow-xl active:scale-95 transition-all`}>
              <span className="text-lg font-black mb-2 uppercase tracking-tight">{sub.name}</span>
              <span className="text-5xl">{sub.icon}</span>
            </button>
          ))}
        </div>
      )}

      {screen === 'INPUT' && (
        <div className="space-y-10 animate-in fade-in">
          <div className="w-full aspect-[16/10] bg-blue-50/70 rounded-[2.5rem] flex items-center justify-center overflow-hidden border-2 border-blue-100 relative shadow-inner">
            {image ? <img src={image} className="p-4 h-full object-contain" /> : <div className="p-10 text-center text-blue-900/30 font-bold">{voiceText || "Sẵn sàng..."}</div>}
          </div>
          <div className="flex justify-between items-center px-4">
            <button onClick={() => setScreen('CROP')} className="w-16 h-16 rounded-3xl bg-blue-600 text-white shadow-lg flex items-center justify-center"><span className="text-2xl">📸</span></button>
            <input type="file" id="f" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onload = (ev) => setImage(ev.target?.result as string); r.readAsDataURL(f); } }} />
            <button onClick={() => document.getElementById('f')?.click()} className="w-16 h-16 rounded-3xl bg-blue-600 text-white shadow-lg flex items-center justify-center"><span className="text-2xl">🖼️</span></button>
            <button onClick={() => setIsRecording(!isRecording)} className={`w-16 h-16 rounded-3xl ${isRecording ? 'bg-red-500' : 'bg-blue-600'} text-white shadow-lg flex items-center justify-center`}><span className="text-2xl">🎙️</span></button>
            <button onClick={handleRunAnalysis} className="w-16 h-16 rounded-3xl bg-blue-600 text-white shadow-lg flex items-center justify-center"><span className="text-2xl">🚀</span></button>
          </div>
        </div>
      )}

      {screen === 'CROP' && image && (
        <div className="flex flex-col items-center">
          <div className="rounded-2xl overflow-hidden border-4 border-blue-600"><ReactCrop crop={crop} onChange={c => setCrop(c)}><img src={image} onLoad={onImageLoad} className="max-h-[60vh]" /></ReactCrop></div>
          <button onClick={() => { saveToDiary('IMAGE', image); setScreen('INPUT'); }} className="mt-8 px-12 py-4 bg-blue-600 text-white rounded-full font-black">LƯU & XÁC NHẬN ✅</button>
        </div>
      )}

      {screen === 'ANALYSIS' && (
        <div className="space-y-6">
          <div className="flex bg-blue-50 p-1.5 rounded-2xl">
            {Object.values(MENU_TYPES).map(m => <button key={m} onClick={() => setActiveMenu(m)} className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all ${activeMenu === m ? 'bg-white text-blue-600 shadow-md' : 'text-blue-300'}`}>{m}</button>)}
          </div>
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl min-h-[400px] relative">
            <div className="flex justify-between mb-6">
              <button onClick={() => saveToDiary('VOICE', 'Kết quả bài học quan trọng')} className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full hover:bg-emerald-100">💾 LƯU KẾT QUẢ</button>
              <button onClick={() => speakVietnamese("Nội dung bài học...")} className={`p-3 rounded-full ${isSpeaking ? 'bg-red-500 text-white' : 'bg-blue-50 text-blue-600'}`}>🔊</button>
            </div>
            <div className="prose prose-slate text-sm">{activeMenu === MENU_TYPES.ANSWER ? "$x = 100$" : "Đang hiển thị chi tiết..."}</div>
          </div>
        </div>
      )}

{/* --- MÀN HÌNH NHẬT KÝ (BẢN NÂNG CẤP XÓA & CHIA SẺ) --- */}
      {screen === 'DIARY' && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-black text-blue-600 uppercase tracking-widest text-lg">Lịch sử học tập</h2>
            {diaryEntries.length > 0 && (
              <button 
                onClick={() => { if(window.confirm("Xóa toàn bộ nhật ký?")) { setDiaryEntries([]); localStorage.removeItem('study_diary'); } }}
                className="text-[10px] font-black text-red-500 bg-red-50 px-3 py-2 rounded-xl active:scale-90 transition-all"
              >
                XÓA TẤT CẢ 🗑️
              </button>
            )}
          </div>

          <div className="space-y-4">
            {diaryEntries.map(entry => (
              <div key={entry.id} className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-50 relative group">
                <div className="flex items-center gap-4">
                  {/* Icon môn học */}
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-xs shadow-md ${
                    entry.subject === Subject.MATH ? 'bg-indigo-600' : 
                    entry.subject === Subject.PHYSICS ? 'bg-violet-600' : 'bg-emerald-600'
                  }`}>
                    {entry.subject.substring(0, 1)}
                  </div>

                  <div className="flex-1">
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">{entry.time}</p>
                    <p className="text-sm font-black text-slate-700 leading-tight mb-2">
                      {entry.type === 'IMAGE' ? '📷 Bài tập bằng hình ảnh' : `🎙️ ${entry.content.substring(0, 30)}...`}
                    </p>
                    
                    {/* BỘ NÚT CHỨC NĂNG MỚI */}
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          if (navigator.share) {
                            navigator.share({
                              title: `Giải bài ${entry.subject}`,
                              text: `Xem lời giải bài tập này trên App của mình!`,
                              url: window.location.href,
                            }).catch(() => {});
                          } else {
                            alert("Trình duyệt không hỗ trợ chia sẻ trực tiếp. Hãy chụp màn hình nhé!");
                          }
                        }}
                        className="flex items-center gap-1 text-[9px] font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-all"
                      >
                        CHIA SẺ 📤
                      </button>
                      
                      <button 
                        onClick={() => {
                          const updated = diaryEntries.filter(e => e.id !== entry.id);
                          setDiaryEntries(updated);
                          localStorage.setItem('study_diary', JSON.stringify(updated));
                        }}
                        className="text-[9px] font-black text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full hover:bg-red-50 hover:text-red-500 transition-all"
                      >
                        XÓA 🗑️
                      </button>
                    </div>
                  </div>

                  {/* Ảnh xem trước nhỏ */}
                  {entry.type === 'IMAGE' && (
                    <img src={entry.content} className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-50 shadow-sm" alt="Preview" />
                  )}
                </div>
              </div>
            ))}
          </div>

          {diaryEntries.length === 0 && (
            <div className="bg-white rounded-[2.5rem] p-16 text-center shadow-inner border border-dashed border-slate-200">
              <span className="text-5xl block mb-4 opacity-20">📔</span>
              <p className="text-slate-300 italic font-medium">Bạn chưa lưu bài học nào hôm nay.</p>
            </div>
          )}
        </div>
      )}

      
