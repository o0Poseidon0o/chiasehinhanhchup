import React, { useState } from 'react';
import { Lock, Loader2 } from 'lucide-react';

export const PasscodeModal = ({ albumTitle, onSubmit, loading, error }) => {
  const [passcode, setPasscode] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (passcode.trim()) {
      onSubmit(passcode.trim());
    }
  };

  return (
    <div className="max-w-md mx-auto my-16 px-4 animate-fade-in">
      <form
        onSubmit={handleSubmit}
        className="glass-panel rounded-2xl p-8 space-y-6 shadow-2xl relative overflow-hidden border border-[#2b2722]"
      >
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-gold-600 via-gold-400 to-gold-600" />

        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-gold-500/10 border border-gold-500/25 rounded-full flex items-center justify-center mx-auto text-gold-400">
            <Lock className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-gold-200">Album này được bảo mật</h2>
          <p className="text-xs text-[#a2998a]">
            {albumTitle ? `Album "${albumTitle}" yêu cầu mã PIN để truy cập.` : 'Vui lòng nhập mã PIN do thợ chụp ảnh cung cấp.'}
          </p>
        </div>

        {error && (
          <div className="bg-red-950/40 border border-red-500/35 text-red-300 p-3 rounded-xl text-center text-xs animate-fade-in">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <input
            type="password"
            autoFocus
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            placeholder="Nhập mã PIN"
            required
            className="w-full bg-[#161412] border border-[#2b2722] rounded-xl px-4 py-3.5 text-center text-xl focus:outline-none focus:border-gold-500 transition-all font-mono tracking-widest text-[#f5eedf]"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !passcode}
          className="w-full bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 text-gold-950 font-bold py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center space-x-2 text-sm disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Đang xác nhận...</span>
            </>
          ) : (
            <span>TRUY CẬP ALBUM</span>
          )}
        </button>
      </form>
    </div>
  );
};

export default PasscodeModal;
