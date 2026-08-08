import React from 'react';
import { Image, Video, Edit3, Folder, ShieldCheck, Download } from 'lucide-react';

export default function SidebarNav({ activeTab, setActiveTab, isAdultMode, onOpenExportModal }) {
  const navItems = [
    { id: 'image', label: 'Image Studio', icon: Image },
    { id: 'video', label: 'Video Studio', icon: Video },
    { id: 'canvas', label: 'Inpaint', icon: Edit3 },
    { id: 'gallery', label: 'Projects', icon: Folder },
    { id: 'safety', label: 'Safety', icon: ShieldCheck },
  ];

  return (
    <div className="md:hidden fixed bottom-3 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md">
      <div className={`p-1.5 rounded-2xl backdrop-blur-xl border flex items-center justify-around shadow-2xl transition-all ${
        isAdultMode 
          ? 'bg-[#180509]/90 border-rose-600/40 shadow-rose-950/80' 
          : 'bg-[#0d0e17]/90 border-white/15 shadow-indigo-950/80'
      }`}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center px-3 py-1.5 rounded-xl transition-all ${
                isActive 
                  ? (isAdultMode ? 'bg-rose-600 text-white font-bold scale-105' : 'bg-indigo-600 text-white font-bold scale-105') 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </button>
          );
        })}
        <button
          onClick={onOpenExportModal}
          className="flex flex-col items-center px-3 py-1.5 rounded-xl text-pink-400 font-bold hover:text-pink-300"
          title="Download EXE / APK"
        >
          <Download className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">App</span>
        </button>
      </div>
    </div>
  );
}
