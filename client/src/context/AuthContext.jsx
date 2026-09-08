import React, { createContext, useContext, useState, useEffect } from 'react';
import { userApi } from '../api/userApi';
import { albumApi } from '../api/albumApi';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = sessionStorage.getItem('userData');
      if (savedUser) {
        return JSON.parse(savedUser);
      }
      const savedPassword = sessionStorage.getItem('adminPassword');
      const savedRole = sessionStorage.getItem('userRole');
      if (savedPassword) {
        return {
          role: savedRole || 'admin',
          name: savedRole === 'photographer' ? 'Nhiếp Ảnh Gia' : 'Quản Trị Viên',
          email: 'admin@potonow.vn',
          status: 'active',
          authenticated: true,
        };
      }
    } catch (_) {}
    return null;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalInitialTab, setAuthModalInitialTab] = useState('login'); // 'login' | 'register'
  const [authModalInitialRole, setAuthModalInitialRole] = useState('photographer');
  const [redirectAfterAuth, setRedirectAfterAuth] = useState(null);

  // Sync state
  useEffect(() => {
    if (currentUser) {
      sessionStorage.setItem('userData', JSON.stringify(currentUser));
      if (currentUser.role === 'admin') {
        if (!sessionStorage.getItem('adminPassword')) {
          sessionStorage.setItem('adminPassword', 'admin123');
        }
      }
      sessionStorage.setItem('userRole', currentUser.role);
    }
  }, [currentUser]);

  /**
   * Đăng nhập người dùng
   */
  const login = async ({ emailOrPhone, password, role = 'photographer' }) => {
    try {
      // 1. Thử login qua API users
      const res = await userApi.login({ emailOrPhone, password });
      const user = {
        ...res.user,
        authenticated: true
      };

      if (user.role === 'admin') {
        sessionStorage.setItem('adminPassword', password || 'admin123');
      } else {
        // Cho photographer dùng tạm admin header nếu cần gọi api album
        sessionStorage.setItem('adminPassword', password || 'admin123');
      }

      sessionStorage.setItem('userRole', user.role);
      sessionStorage.setItem('userData', JSON.stringify(user));
      setCurrentUser(user);
      setIsAuthModalOpen(false);
      return { success: true, user };
    } catch (error) {
      // 2. Fallback kiểm tra mật khẩu Admin nếu nhập trực tiếp
      if (password) {
        try {
          await albumApi.adminLogin(password);
          const adminUser = {
            _id: 'master_admin',
            role: 'admin',
            name: 'Quản Trị Hệ Thống (Master Admin)',
            email: 'admin@potonow.vn',
            status: 'active',
            authenticated: true,
          };
          sessionStorage.setItem('adminPassword', password);
          sessionStorage.setItem('userRole', 'admin');
          sessionStorage.setItem('userData', JSON.stringify(adminUser));
          setCurrentUser(adminUser);
          setIsAuthModalOpen(false);
          return { success: true, user: adminUser };
        } catch (_) {}
      }
      throw error;
    }
  };

  /**
   * Đăng ký tài khoản mới
   */
  const register = async (userData) => {
    try {
      const res = await userApi.register(userData);
      return res;
    } catch (error) {
      throw error;
    }
  };

  /**
   * Dọn dẹp triệt để toàn bộ lưu trữ của trình duyệt (localStorage & sessionStorage)
   * Đảm bảo tính bảo mật tuyệt đối: Sau khi đăng xuất là xóa sạch hoàn toàn mọi dấu vết
   */
  const wipeAllClientStorage = () => {
    try {
      // Giữ lại cài đặt giao diện (theme) để không bị giật nháy màn hình
      const savedTheme = localStorage.getItem('app_theme');

      // Xóa toàn bộ localStorage (xóa lịch sử đơn booking, pinned albums, credentials, tokens...)
      localStorage.clear();

      if (savedTheme) {
        localStorage.setItem('app_theme', savedTheme);
      }
    } catch (e) {
      console.warn('Lỗi dọn dẹp localStorage:', e);
    }

    try {
      // Xóa toàn bộ sessionStorage (xóa mật khẩu admin, session user, passcodes album...)
      sessionStorage.clear();
    } catch (e) {
      console.warn('Lỗi dọn dẹp sessionStorage:', e);
    }
  };

  /**
   * Đăng xuất người dùng & xóa sạch mọi dấu vết bảo mật
   */
  const logout = () => {
    wipeAllClientStorage();
    setCurrentUser(null);
    // Chuyển hướng về trang chủ và làm mới trang để giải phóng toàn bộ bộ nhớ RAM & React State
    window.location.href = '/';
  };

  /**
   * Mở modal xác thực
   */
  const openAuthModal = (redirectPath = null, initialTab = 'login', initialRole = 'photographer') => {
    setRedirectAfterAuth(redirectPath);
    setAuthModalInitialTab(initialTab);
    setAuthModalInitialRole(initialRole);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setRedirectAfterAuth(null);
  };

  /**
   * Cập nhật thông tin người dùng hiện tại (cập nhật state & sessionStorage)
   */
  const updateCurrentUser = (updatedFields) => {
    setCurrentUser(prev => {
      const updated = { ...prev, ...updatedFields };
      try {
        sessionStorage.setItem('userData', JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoggedIn: Boolean(currentUser?.authenticated),
        isAdmin: currentUser?.role === 'admin',
        isPhotographer: currentUser?.role === 'photographer',
        isClient: currentUser?.role === 'client',
        login,
        register,
        logout,
        wipeAllClientStorage,
        updateCurrentUser,
        isAuthModalOpen,
        authModalInitialTab,
        authModalInitialRole,
        redirectAfterAuth,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
