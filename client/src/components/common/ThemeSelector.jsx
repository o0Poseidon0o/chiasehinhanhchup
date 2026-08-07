import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Palette, Check } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const ThemeSelector = () => {
  const { theme, setTheme, themes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Đóng dropdown khi bấm ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentThemeObj = themes.find((t) => t.id === theme) || themes[0];

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Nút kích hoạt đổi giao diện */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#161412] hover:bg-[#221f1c] border border-[#2b2722] hover:border-gold-500/40 text-gold-200 transition-all duration-200 shadow-sm"
        title="Đổi màu sắc giao diện (Sáng / Tối / Tông màu khác)"
      >
        <span className="text-sm">{currentThemeObj.icon}</span>
        <span className="hidden sm:inline">{currentThemeObj.name}</span>
        <Palette className="w-3.5 h-3.5 text-gold-400 opacity-70 ml-0.5" />
      </button>

      {/* Menu thả xuống chọn giao diện */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#141210] border border-[#2d2720] shadow-2xl p-2 z-50 animate-fade-in backdrop-blur-xl">
          <div className="px-3 py-2 border-b border-[#221f1c] mb-1">
            <span className="text-xs font-bold text-gold-200 block">Tùy chọn Màu Sắc Giao Diện</span>
            <span className="text-[10px] text-[#8e8475] block">Chọn tông màu sáng hoặc tối để dễ nhìn nhất</span>
          </div>

          <div className="space-y-1">
            {themes.map((t) => {
              const isSelected = t.id === theme;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    setTheme(t.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs text-left transition-all duration-150 ${
                    isSelected
                      ? 'bg-gold-500/15 border border-gold-500/40 text-gold-200 font-bold'
                      : 'hover:bg-[#1e1a16] text-[#cfc5b4]'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="text-base">{t.icon}</span>
                    <div>
                      <div className="font-semibold">{t.name}</div>
                      <div className="text-[10px] text-[#8e8475]">{t.description}</div>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-gold-400 shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeSelector;
