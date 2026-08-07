import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Home from './pages/Home';
import AlbumView from './pages/AlbumView';
import AdminManage from './pages/AdminManage';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#0c0b0a] text-[#f5eedf] flex flex-col font-sans selection:bg-gold-500 selection:text-gold-950">
        {/* Navigation Bar */}
        <Navbar />

        {/* Main Content Workspace */}
        <main className="flex-grow w-full max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/dashboard" element={<AdminDashboard />} />
            <Route path="/album/:id" element={<AlbumView />} />
            <Route path="/album/:id/manage" element={<AdminManage />} />
          </Routes>
        </main>

        {/* Global Footer */}
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
