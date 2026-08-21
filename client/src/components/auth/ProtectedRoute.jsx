import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Lock, ShieldAlert, ArrowLeft, KeyRound, Sparkles, Camera } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isLoggedIn, currentUser, openAuthModal } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // If not logged in at all
  if (!isLoggedIn) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center py-12 px-4 animate-fade-in">
        <div className="w-full max-w-lg bg-[#141720] border border-[#2b3245] rounded-3xl p-8 text-center text-[#f8fafc] shadow-2xl relative overflow-hidden">
          {/* Background Ambient */}
          <div className="absolute -top-20 -right-20 w-44 h-44 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-44 h-44 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="inline-flex p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-400 mb-6 shadow-inner">
            <Lock className="w-10 h-10" />
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">
            Khu Vực Ứng Dụng Được Bảo Vệ
          </h2>
          <p className="text-sm text-gray-300 mb-8 max-w-md mx-auto leading-relaxed">
            Phần ứng dụng Tạo và Quản lý Album ảnh chỉ dành cho Nhiếp ảnh gia, Studio hoặc Quản trị viên được cấp quyền truy cập.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => openAuthModal(location.pathname)}
              className="flex-1 inline-flex items-center justify-center space-x-2 py-3 px-6 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-amber-950 font-bold rounded-xl text-sm shadow-lg shadow-amber-500/20 transition-all duration-200"
            >
              <KeyRound className="w-4 h-4" />
              <span>Đăng Nhập / Xác Thực Quyền</span>
            </button>

            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center justify-center space-x-2 py-3 px-5 bg-[#0c0d12] hover:bg-[#1c2230] border border-[#2b3245] text-gray-300 hover:text-white font-medium rounded-xl text-sm transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Về Trang Chủ</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If role is restricted (e.g. requires 'admin' but user is only 'photographer')
  if (requiredRole && currentUser?.role !== requiredRole && currentUser?.role !== 'admin') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center py-12 px-4 animate-fade-in">
        <div className="w-full max-w-md bg-[#141720] border border-amber-500/30 rounded-3xl p-8 text-center text-[#f8fafc] shadow-2xl">
          <div className="inline-flex mb-5">
            <img
              src="/Photodate.svg"
              alt="Photodate Logo"
              className="w-14 h-14 rounded-2xl object-contain shadow-lg"
            />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Không Gian Master Admin</h2>
          <p className="text-xs sm:text-sm text-gray-300 mb-6 leading-relaxed">
            Bạn đang đăng nhập với tài khoản Nhiếp ảnh gia <strong className="text-white">"{currentUser?.name}"</strong>. Trang này dành cho Quản trị viên cấp cao.
          </p>

          <div className="space-y-2.5">
            <button
              onClick={() => navigate('/app')}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-amber-950 font-bold rounded-2xl text-xs sm:text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 transition-all"
            >
              <span>Vào Studio Workspace Của Bạn</span>
              <Sparkles className="w-4 h-4" />
            </button>

            <button
              onClick={() => openAuthModal(location.pathname)}
              className="w-full py-2.5 px-4 bg-[#0c0d12] hover:bg-[#1a202c] border border-[#2b3245] text-gray-400 hover:text-white rounded-xl text-xs font-semibold transition-colors"
            >
              Đăng Nhập Bằng Mật Khẩu Admin
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
