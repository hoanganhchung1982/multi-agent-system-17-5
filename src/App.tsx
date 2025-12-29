import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

import { Subject, AgentType } from '../types';
import { Layout } from '../components/Layout';

// Định nghĩa 3 Menu kết quả như bạn mong muốn
const MENU_TYPES = {
  ANSWER: '🎯Mắt thần',
  GUIDE: '📝Gia sư ảo',
  QUIZ: '✏️Luyện Skill'
};

const App: React.FC = () => {
  // --- STATE ---
  const [screen, setScreen] = useState<'HOME' | 'INPUT' | 'CROP' | 'ANALYSIS' | 'DIARY'>('HOME');
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [activeMenu, setActiveMenu] = useState(MENU_TYPES.ANSWER);
  
  // Dữ liệu nhập liệu
  const [image, setImage] = useState<string | null>(null);
  const [voiceText, setVoiceText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  
  // Crop Image State
  const [crop, setCrop] = useState<Crop>();
  const [imgRef, setImgRef] = useState<HTMLImageElement | null>(null);

  // Audio State
  const [isSpeaking, setIsSpeaking] = useState(false);

  // --- LOGIC ĐỌC TIẾNG VIỆT (KHÔNG CẦN KEY) ---
  const speakVietnamese = (text: string) => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text.replace(/[$#*]/g, ''));
    utterance.lang = 'vi-VN';
    utterance.rate = 0.9; // Đọc chậm một chút cho dễ nghe
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  // --- LOGIC XỬ LÝ ẢNH & CROP ---
  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const initialCrop = centerCrop(
      makeAspectCrop({ unit: '%', width: 80 }, 1, width, height),
      width,
      height
    );
    setCrop(initialCrop);
    setImgRef(e.currentTarget);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImage(ev.target?.result as string);
        setScreen('CROP'); // Chuyển sang màn hình Crop ngay sau khi chọn ảnh
      };
      reader.readAsDataURL(file);
    }
  };

  // --- LOGIC NÚT ĐỒNG Ý (🚀) ---
  const handleRunAnalysis = () => {
    if (!image && !voiceText) return alert("Vui lòng chụp ảnh hoặc nói đề bài!");
    
    // Mở Google Search/Lens để tìm kiếm thật
    if (voiceText) {
      window.open(`https://www.google.com/search?q=${encodeURIComponent(voiceText + " giải chi tiết")}`, '_blank');
    } else {
      window.open('https://images.google.com/', '_blank');
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
      {/* 1. MÀN HÌNH CHÍNH: GIỮ NGUYÊN MÀU GỐC CỦA BẠN */}
      {screen === 'HOME' && (
        <div className="grid grid-cols-2 gap-4 mt-4 animate-in fade-in zoom-in duration-500">
          {[
            { name: Subject.MATH, color: 'bg-indigo-600', icon: '📐' },
            { name: Subject.PHYSICS, color: 'bg-violet-600', icon: '⚛️' },
            { name: Subject.CHEMISTRY, color: 'bg-emerald-600', icon: '🧪' },
            { name: Subject.DIARY, color: 'bg-amber-600', icon: '📔' },
          ].map((sub) => (
            <button 
              key={sub.name} 
              onClick={() => {
                if (sub.name === Subject.DIARY) setScreen('DIARY');
                else { setSelectedSubject(sub.name as Subject); setScreen('INPUT'); }
              }} 
              className={`${sub.color} aspect-square rounded-[2.5rem] flex flex-col items-center justify-center text-white shadow-xl active:scale-95 transition-all`}
            >
              <span className="text-lg font-black mb-2 uppercase tracking-tight">{sub.name}</span>
              <span className="text-5xl">{sub.icon}</span>
            </button
