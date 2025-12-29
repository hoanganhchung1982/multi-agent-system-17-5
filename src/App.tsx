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
  content: string; 
  time: string;
}

const App: React.FC = () => {
  const [screen, setScreen] = useState<'HOME' | 'INPUT' | 'CROP' | 'ANALYSIS' | 'DIARY'>('HOME');
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [activeMenu, setActiveMenu] = useState(MENU_TYPES.ANSWER);
  const [image, setImage] = useState<string | null>(null);
  const [voiceText, setVoiceText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Thêm state loading
  const [crop, setCrop] = useState<Crop>();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('study_diary');
    if (saved) setDiaryEntries(JSON.parse(saved));
  }, []);

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
    
    setIsLoading(true); // Bắt đầu loading
    saveToDiary(image ? 'IMAGE' : 'VOICE', image || voiceText);
    
    // Giả lập thời gian xử lý 1.5s để tạo hiệu ứng chuyên nghiệp
    setTimeout(() => {
      if (voiceText) window.open(`https://www.google.com/search?q=${encodeURIComponent(voiceText)}`, '_blank');
      else window.open('https://www.google.com/searchbyimage', '_blank');
      
      setIsLoading(false);
      setScreen('ANALYSIS');
    }, 1500);
  };

  return (
    <Layout 
      onBack={() => {
        if (screen === 'ANALYSIS' || screen === 'CROP') setScreen('INPUT');
        else if (screen === 'INPUT' || screen === 'DIARY') setScreen('HOME');
      }}
      title={selectedSubject || (screen === 'DIARY' ? 'Nhật ký' : '')}
    >
      {/* --- MÀN HÌNH CHÍNH --- */}
      {screen === 'HOME' && (
        <div className="grid grid-cols-2 gap-5 mt-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {[
            { name: Subject.MATH, color: 'from-indigo-600 to-blue-500', icon: '📐' },
            { name: Subject.PHYSICS, color: 'from-violet-600 to-purple-500', icon: '⚛️' },
            { name: Subject.CHEMISTRY, color: 'from-emerald-600 to-teal-500', icon: '🧪' },
            { name: Subject.DIARY, color: 'from-amber-500 to-orange-400', icon: '📔' },
          ].map((sub) => (
            <button 
              key={sub.name} 
              onClick={() => { if (sub.name === Subject.DIARY) setScreen('DIARY'); else { setSelectedSubject(sub.name as Subject); setScreen('INPUT'); } }} 
              className={`bg-gradient-to-br ${sub.color} aspect-square rounded-[2.5rem] flex flex-col items-center justify-center text-white shadow-xl shadow-blue-200/50 active:scale-95 transition-all duration-300 group`}
            >
              <span className="text-lg font-black mb-2 uppercase tracking-tight group-hover:scale-110 transition-transform">{sub.name}</span>
              <span className="text-5xl drop-shadow-lg">{sub.icon}</span>
            </button>
          ))}
        </div>
      )}

      {/* --- MÀN HÌNH NHẬP LIỆU (CÓ LOADING) --- */}
      {screen === 'INPUT' && (
        <div className="space-y-10 animate-in fade-in zoom-in-95 duration-500">
          <div className="w-full aspect-[16/10] bg-white rounded-[3rem] flex items-center justify-center overflow-hidden border-2 border-slate-100 relative shadow-2xl">
            {image ? (
              <img src={image} className="p-6 h-full object-contain animate-in fade-in" />
            ) : (
              <div className="p-10 text-center text-slate-300 font-black uppercase tracking-widest text-xs">
                {voiceText || "Sẵn sàng nhận dữ liệu..."}
              </div>
            )}
            
            {/* OVERLAY LOADING */}
            {isLoading && (
              <div className="absolute inset-0 bg-indigo-600/90 backdrop-blur-md flex flex-col items-center justify-center text-white z-50 animate-in fade-in">
                <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mb-4"></div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em]">Đang trích xuất dữ liệu...</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-4 gap-4 px-2">
            {[
              { icon: '📸', label: 'Cam', action: () => setScreen('CROP') },
              { icon: '🖼️', label: 'Ảnh', action: () => document.getElementById('f')?.click() },
              { icon: isRecording ? '⏹️' : '🎙️', label: 'Mic', action: () => setIsRecording(!isRecording), active: isRecording },
              { icon: '🚀', label: 'Giải', action: handleRunAnalysis, primary: true }
            ].map((btn, i) => (
              <div key={i} className="flex flex-col items-center space-y-2">
                <button 
                  onClick={btn.action} 
                  className={`w-full aspect-square rounded-[1.8rem] flex items-center justify-center text-2xl shadow-lg transition-all active:scale-75 ${
                    btn.primary ? 'bg-indigo-600 text-white shadow-indigo-200' : 
                    btn.active ? 'bg-red-500 text-white animate-pulse' : 'bg-white text-indigo-600 border border-slate-50'
                  }`}
                >
                  {btn.icon}
                </button>
                <span className="text-[9px] font-black uppercase text-slate-400">{btn.label}</span>
              </div>
            ))}
            <input type="file" id="f" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onload = (ev) => setImage(ev.target?.result as string); r.readAsDataURL(f); } }} />
          </div>
        </div>
      )}

      {/* --- MÀN HÌNH CROP --- */}
      {screen === 'CROP' && image && (
        <div className="flex flex-col items-center animate-in fade-in duration-500">
          <div className="rounded-[2.5rem] overflow-hidden border-4 border-indigo-600 shadow-2xl">
            <ReactCrop crop={crop} onChange={c => setCrop(c)}>
              <img src={image} onLoad={onImageLoad} className="max-h-[55vh]" />
            </ReactCrop>
          </div>
          <button 
            onClick={() => { saveToDiary('IMAGE', image); setScreen('INPUT'); }} 
            className="mt-10 px-12 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl active:scale-95 transition-all uppercase tracking-widest text-sm"
          >
            LƯU & XÁC NHẬN ✅
          </button>
        </div>
      )}

      {/* --- MÀN HÌNH PHÂN TÍCH --- */}
      {screen === 'ANALYSIS' && (
        <div className="space-y-6 animate-in slide-in-from-right duration-500">
          <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-white">
            {Object.values(MENU_TYPES).map(m => (
              <button 
                key={m} 
                onClick={() => setActiveMenu(m)} 
                className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all ${
                  activeMenu === m ? 'bg-white text-indigo-600 shadow-md scale-105' : 'text-slate-400'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          <div className="bg-white rounded-[3rem] p-8 border border-slate-50 shadow-2xl min-h-[400px] relative">
            <div className="flex justify-between mb-8">
              <button onClick={() => saveToDiary('VOICE', 'Kết quả học tập')} className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-5 py-2.5 rounded-full hover:bg-emerald-100 transition-colors">💾 LƯU KẾT QUẢ</button>
              <button onClick={() => speakVietnamese("Đang hiển thị kết quả từ Google...")} className={`p-3 rounded-full shadow-sm transition-all ${isSpeaking ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-50 text-indigo-600'}`}>🔊</button>
            </div>
            <div className="prose prose-slate text-sm text-center py-10 opacity-60 italic">
               Kết quả đang được mở ở tab mới...
            </div>
          </div>
        </div>
      )}

      {/* --- MÀN HÌNH NHẬT KÝ --- */}
      {screen === 'DIARY' && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-between items-center mb-6 px-2">
            <h2 className="font-black text-indigo-600 uppercase tracking-widest text-lg">Lịch sử học tập</h2>
            {diaryEntries.length > 0 && (
              <button 
                onClick={() => { if(window.confirm("Xóa toàn bộ nhật ký?")) { setDiaryEntries([]); localStorage.removeItem('study_diary'); } }}
                className="text-[10px] font-black text-red-500 bg-red-50 px-4 py-2 rounded-xl active:scale-90 transition-all"
              >
                XÓA TẤT CẢ 🗑️
              </button>
            )}
          </div>

          <div className="space-y-4">
            {diaryEntries.map(entry => (
              <div key={entry.id} className="bg-white p-5 rounded-[2.2rem] shadow-sm border border-slate-50 flex items-center gap-4 group hover:shadow-md transition-all">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-xs shadow-md ${
                    entry.subject === Subject.MATH ? 'bg-indigo-600' : 
                    entry.subject === Subject.PHYSICS ? 'bg-violet-600' : 'bg-emerald-600'
                  }`}>
                    {entry.subject.substring(0, 1)}
                </div>

                <div className="flex-1">
                  <p className="text-[9px] text-slate-300 font-bold uppercase tracking-tighter">{entry.time}</p>
                  <p className="text-sm font-black text-slate-700 leading-tight">
                    {entry.type === 'IMAGE' ? '📷 Bài tập hình ảnh' : `🎙️ ${entry.content.substring(0, 25)}...`}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <button className="text-[9px] font-black text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full">📤 CHIA SẺ</button>
                    <button onClick={() => {
                        const updated = diaryEntries.filter(e => e.id !== entry.id);
                        setDiaryEntries(updated);
                        localStorage.setItem('study_diary', JSON.stringify(updated));
                    }} className="text-[9px] font-black text-slate-400 bg-slate-50 px-3 py-1 rounded-full hover:text-red-500 transition-colors">🗑️ XÓA</button>
                  </div>
                </div>

                {entry.type === 'IMAGE' && (
                  <img src={entry.content} className="w-16 h-16 rounded-2xl object-cover border border-slate-100 shadow-sm" />
                )}
              </div>
            ))}
          </div>

          {diaryEntries.length === 0 && (
            <div className="bg-white rounded-[3rem] p-20 text-center shadow-inner border border-dashed border-slate-100">
              <span className="text-6xl block mb-4 opacity-10">📔</span>
              <p className="text-slate-300 italic font-medium">Bạn chưa lưu bài học nào hôm nay.</p>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
};

export default App;
