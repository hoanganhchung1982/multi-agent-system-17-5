import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  onBack?: () => void;
  title?: string;
}

export const Layout: React.FC<LayoutProps> = React.memo(({ children, onBack, title }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 text-slate-900 font-sans">
      {/* Header Tinh Gọn */}
      <header className="pt-6 pb-2 px-6 text-center relative bg-white/80 backdrop-blur-md sticky top-0 z-[100] border-b border-slate-100">
        {onBack && (
          <button 
            onClick={onBack}
            className="absolute left-6 top-6 p-2 rounded-xl bg-slate-100 text-slate-600 active:scale-90 transition-all shadow-sm"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
        )}
        <div className="mb-2">
          <h1 className="text-xl font-black tracking-tighter text-indigo-600 uppercase">Symbiotic AI</h1>
          {!title && <p className="text-[10px] font-bold text-slate-400 tracking-[0.2em] uppercase">Multi Agent Systems</p>}
        </div>
        
        {title && (
          <div className="pb-2 animate-in fade-in slide-in-from-top-2">
            <span className="px-4 py-1 bg-indigo-600 text-white rounded-full text-[10px] font-black tracking-widest uppercase shadow-md shadow-indigo-200">
              {title}
            </span>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-xl mx-auto w-full px-5 py-6">
        {children}
      </main>

      {/* Footer Nhỏ Gọn (Tránh chiếm diện tích) */}
      <footer className="py-8 px-6 text-center opacity-40">
        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
          Dự án KHKT 2025 • THPT Mai Sơn
        </div>
      </footer>
    </div>
  );
});
