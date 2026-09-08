import React, { useState, useEffect } from 'react';
import { Phone, MessageCircle, X, Sparkles } from 'lucide-react';
import { settingApi } from '../../api/settingApi';

// Official Zalo Logo SVG
const ZaloIcon = ({ className = "w-8 h-8" }) => (
  <svg viewBox="0 0 44 44" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="22" cy="22" r="22" fill="#0068FF" />
    <path 
      d="M13.5 15.5C13.5 14.12 14.62 13 16 13H28C29.38 13 30.5 14.12 30.5 15.5V23.5C30.5 24.88 29.38 26 28 26H20.8L15.5 29.5C15.05 29.8 14.5 29.48 14.5 28.95V26H16C14.62 26 13.5 24.88 13.5 23.5V15.5Z" 
      fill="white"
    />
    <text 
      x="22" 
      y="21.5" 
      fill="#0068FF" 
      fontSize="8.5" 
      fontWeight="900" 
      textAnchor="middle" 
      fontFamily="system-ui, -apple-system, sans-serif"
      letterSpacing="-0.3px"
    >
      Zalo
    </text>
  </svg>
);

// Official Meta Messenger Logo SVG
const MessengerIcon = ({ className = "w-8 h-8" }) => (
  <svg viewBox="0 0 44 44" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="messenger-fab-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#00C6FF" />
        <stop offset="50%" stopColor="#0078FF" />
        <stop offset="100%" stopColor="#A033FF" />
      </linearGradient>
    </defs>
    <circle cx="22" cy="22" r="22" fill="url(#messenger-fab-gradient)" />
    <path 
      fillRule="evenodd" 
      clipRule="evenodd" 
      d="M22 10.5C15.65 10.5 10.5 15.22 10.5 21.05C10.5 24.37 12.12 27.32 14.65 29.21V32.42L17.76 30.71C19.02 31.25 20.47 31.6 22 31.6C28.35 31.6 33.5 26.88 33.5 21.05C33.5 15.22 28.35 10.5 22 10.5ZM23.23 24.77L20.37 21.71L14.65 24.77L20.77 18.23L23.63 21.29L29.35 18.23L23.23 24.77Z" 
      fill="white" 
    />
  </svg>
);

// Official Telegram Logo SVG
const TelegramIcon = ({ className = "w-8 h-8" }) => (
  <svg viewBox="0 0 44 44" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="22" cy="22" r="22" fill="#24A1DE" />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M10.8 21.85L27.8 15.05C28.57 14.71 29.28 15.27 29.05 16.37L26.19 29.92C25.98 30.94 25.35 31.2 24.52 30.7L20.12 27.45L18.01 29.48C17.77 29.72 17.57 29.92 17.11 29.92L17.42 24.95L26.49 16.75C26.88 16.4 26.4 16.2 25.88 16.55L14.68 23.61L9.85 22.1C8.8 21.78 8.78 21.05 10.07 20.54L10.8 21.85Z"
      fill="white"
    />
  </svg>
);

// Phone Icon in Circle
const HotlineIcon = ({ className = "w-8 h-8" }) => (
  <div className={`rounded-full bg-[#006a38] text-white flex items-center justify-center shadow-md ${className}`}>
    <Phone className="w-4 h-4 fill-current stroke-0" />
  </div>
);

export const FloatingContactButton = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [hasNewNotice, setHasNewNotice] = useState(true);

  // Live Contact Settings state with sensible fallbacks
  const [settings, setSettings] = useState({
    hotline: '0777908179',
    hotlineDisplay: '0777 908 179',
    hotlineHours: '8h - 22h hàng ngày',
    enableHotline: true,

    telegramUrl: 'https://t.me/photodate',
    telegramSubtext: 'Chat Telegram 24/7',
    enableTelegram: true,

    zaloUrl: 'https://zalo.me/0777908179',
    zaloSubtext: 'Phản hồi sau 1 phút',
    enableZalo: false,

    messengerUrl: 'https://m.me/photodate.vn',
    messengerSubtext: 'Hỗ trợ 24/7',
    enableMessenger: false,

    supportPillText: 'Tư vấn hỗ trợ',
    supportPillSubtext: 'Trả lời tức thì • 24/7',
    enableSupportPill: true
  });

  const loadSettings = async () => {
    try {
      const res = await settingApi.getContactSettings();
      if (res && res.data) {
        setSettings(prev => ({ ...prev, ...res.data }));
      }
    } catch (e) {
      console.warn('FloatingContactButton: Using default settings', e);
    }
  };

  useEffect(() => {
    loadSettings();

    // Listen for real-time contact settings changes from Admin panel
    const handleSettingsUpdate = (event) => {
      if (event.detail) {
        setSettings(prev => ({ ...prev, ...event.detail }));
      } else {
        loadSettings();
      }
    };

    window.addEventListener('contact_settings_updated', handleSettingsUpdate);
    return () => {
      window.removeEventListener('contact_settings_updated', handleSettingsUpdate);
    };
  }, []);

  const toggleOpen = () => {
    setIsOpen(prev => !prev);
    if (hasNewNotice) setHasNewNotice(false);
  };

  const hasAnyChannel = settings.enableHotline || settings.enableTelegram || settings.enableZalo || settings.enableMessenger;

  return (
    <aside 
      aria-label="Kênh liên hệ nhanh"
      className="fixed bottom-5 sm:bottom-7 right-4 sm:right-6 z-50 flex flex-col items-end pointer-events-none select-none font-sans"
    >
      {/* Contact Pills List (Hotline, Telegram, Zalo, Messenger) */}
      <div 
        className={`flex flex-col items-end space-y-2.5 mb-3 transition-all duration-300 origin-bottom-right ${
          isOpen && hasAnyChannel
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' 
            : 'opacity-0 scale-90 translate-y-4 pointer-events-none max-h-0 overflow-hidden mb-0'
        }`}
      >
        {/* 1. Hotline: Gọi Điện */}
        {settings.enableHotline && (
          <a
            href={`tel:${settings.hotline || '0777908179'}`}
            className="group flex items-center bg-white hover:bg-emerald-50 text-gray-900 border-2 border-[#006a38] rounded-full pl-1.5 pr-4 py-1.5 shadow-xl transition-all duration-200 hover:scale-105 hover:shadow-emerald-900/30 active:scale-95"
            title={`Gọi ngay Hotline ${settings.hotlineDisplay || settings.hotline}`}
          >
            <HotlineIcon className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 group-hover:rotate-12 transition-transform duration-200" />
            <div className="ml-2.5 text-left leading-tight">
              <p className="text-xs sm:text-sm font-extrabold text-[#006a38] tracking-tight">
                Hotline: {settings.hotlineDisplay || settings.hotline}
              </p>
              <p className="text-[10px] sm:text-[11px] font-medium text-gray-500">
                ({settings.hotlineHours || '8h - 22h hàng ngày'})
              </p>
            </div>
          </a>
        )}

        {/* 2. Telegram (Mới thêm) */}
        {settings.enableTelegram && (
          <a
            href={settings.telegramUrl.startsWith('http') ? settings.telegramUrl : `https://t.me/${settings.telegramUrl.replace('@', '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center bg-white hover:bg-sky-50 text-gray-900 border-2 border-[#24A1DE] rounded-full pl-1.5 pr-4 py-1.5 shadow-xl transition-all duration-200 hover:scale-105 hover:shadow-sky-900/30 active:scale-95"
            title="Chat Telegram hỗ trợ 24/7"
          >
            <TelegramIcon className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 group-hover:scale-105 transition-transform duration-200" />
            <div className="ml-2.5 text-left leading-tight">
              <p className="text-xs sm:text-sm font-extrabold text-[#24A1DE] tracking-tight">
                Chat Telegram
              </p>
              <p className="text-[10px] sm:text-[11px] font-medium text-gray-500">
                ({settings.telegramSubtext || 'Chat Telegram 24/7'})
              </p>
            </div>
          </a>
        )}

        {/* 3. Tư Vấn Zalo */}
        {settings.enableZalo && (
          <a
            href={settings.zaloUrl.startsWith('http') ? settings.zaloUrl : `https://zalo.me/${settings.zaloUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center bg-white hover:bg-blue-50 text-gray-900 border-2 border-[#0068FF] rounded-full pl-1.5 pr-4 py-1.5 shadow-xl transition-all duration-200 hover:scale-105 hover:shadow-blue-900/30 active:scale-95"
            title="Nhắn tin Zalo hỗ trợ nhanh"
          >
            <ZaloIcon className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 group-hover:scale-105 transition-transform duration-200" />
            <div className="ml-2.5 text-left leading-tight">
              <p className="text-xs sm:text-sm font-extrabold text-[#0068FF] tracking-tight">
                Tư vấn Zalo
              </p>
              <p className="text-[10px] sm:text-[11px] font-medium text-gray-500">
                ({settings.zaloSubtext || 'Phản hồi sau 1 phút'})
              </p>
            </div>
          </a>
        )}

        {/* 4. Chat Messenger */}
        {settings.enableMessenger && (
          <a
            href={settings.messengerUrl.startsWith('http') ? settings.messengerUrl : `https://m.me/${settings.messengerUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center bg-white hover:bg-purple-50 text-gray-900 border-2 border-[#0078FF] rounded-full pl-1.5 pr-4 py-1.5 shadow-xl transition-all duration-200 hover:scale-105 hover:shadow-purple-900/30 active:scale-95"
            title="Nhắn tin Messenger Facebook"
          >
            <MessengerIcon className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 group-hover:scale-105 transition-transform duration-200" />
            <div className="ml-2.5 text-left leading-tight">
              <p className="text-xs sm:text-sm font-extrabold text-[#0078FF] tracking-tight">
                Chat Messenger
              </p>
              <p className="text-[10px] sm:text-[11px] font-medium text-gray-500">
                ({settings.messengerSubtext || 'Hỗ trợ 24/7'})
              </p>
            </div>
          </a>
        )}
      </div>

      {/* Main Trigger Floating Row */}
      <div className="flex items-center space-x-2.5 pointer-events-auto">
        {/* Left Pill: "Tư vấn nhanh / Hỗ trợ tức thì" */}
        {settings.enableSupportPill && (
          <button
            type="button"
            onClick={toggleOpen}
            className="hidden sm:flex items-center space-x-2 bg-[#006a38] hover:bg-[#00572e] text-white px-3.5 py-2 rounded-full border border-emerald-400/40 shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 group"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-300 animate-ping" />
            <div className="text-left leading-tight">
              <p className="text-xs font-bold text-white flex items-center space-x-1">
                <span>{settings.supportPillText || 'Tư vấn hỗ trợ'}</span>
                <Sparkles className="w-3 h-3 text-amber-300" />
              </p>
              <p className="text-[10px] text-emerald-200 font-medium">
                {settings.supportPillSubtext || 'Trả lời tức thì • 24/7'}
              </p>
            </div>
          </button>
        )}

        {/* Main Circular Button with Pulsing Ring & Badge */}
        <div className="relative">
          {/* Pulsing Ripple Effect */}
          {hasNewNotice && (
            <span className="absolute -inset-1.5 rounded-full bg-emerald-500/40 animate-ping pointer-events-none" />
          )}

          <button
            type="button"
            onClick={toggleOpen}
            aria-label={isOpen ? "Đóng menu hỗ trợ" : "Mở menu liên hệ tư vấn"}
            className={`relative w-13 h-13 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-300 active:scale-90 ${
              isOpen 
                ? 'bg-[#151922] hover:bg-[#1e2330] border-2 border-emerald-500/50 rotate-90 text-emerald-400' 
                : 'bg-gradient-to-tr from-[#006a38] via-[#008748] to-[#10b981] hover:brightness-110 border-2 border-white shadow-emerald-950/50'
            }`}
          >
            {isOpen ? (
              <X className="w-6 h-6 transition-transform duration-200" />
            ) : (
              <MessageCircle className="w-6 h-6 fill-current stroke-0" />
            )}

            {/* Notification Badge '1' */}
            {!isOpen && hasNewNotice && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white font-black text-[11px] rounded-full border-2 border-white flex items-center justify-center shadow-md animate-bounce">
                1
              </span>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default FloatingContactButton;
