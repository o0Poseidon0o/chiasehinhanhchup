import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const THEMES = [
  {
    id: 'dark',
    name: 'Tối Sang Trọng',
    icon: '🌙',
    description: 'Nền đen huyền bí, viền vàng kim cao cấp'
  },
  {
    id: 'light',
    name: 'Sáng Studio',
    icon: '☀️',
    description: 'Nền trắng sáng rõ, độ tương phản cao, dễ nhìn'
  },
  {
    id: 'warm',
    name: 'Kem Ấm Cúng',
    icon: '☕',
    description: 'Tông màu beige kem ấm áp, dịu mắt'
  },
  {
    id: 'slate',
    name: 'Xám Hiện Đại',
    icon: '🏙️',
    description: 'Tông xám xanh thời thượng, rõ nét'
  }
];

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('app_theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('app_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
