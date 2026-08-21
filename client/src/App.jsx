import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import LandingPage from './pages/LandingPage';
import PhotographersPage from './pages/PhotographersPage';
import PhotographerDetailPage from './pages/PhotographerDetailPage';
import BookingPage from './pages/BookingPage';
import StudioWorkspace from './pages/StudioWorkspace';
import AlbumView from './pages/AlbumView';
import AdminManage from './pages/AdminManage';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AuthModal from './components/auth/AuthModal';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-[#0c0d10] text-[#f8fafc] flex flex-col font-sans selection:bg-amber-500 selection:text-amber-950 transition-colors duration-200">
            {/* Navigation Bar */}
            <Navbar />

            {/* Global Auth Modal for Studio/Photographer & Admin Access */}
            <AuthModal />

            {/* Main Content Workspace */}
            <main className="flex-grow w-full max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
              <Routes>
                {/* 1. Potonow-styled Public Landing Page */}
                <Route path="/" element={<LandingPage />} />
                
                {/* 1.1 Public Photographers List & Profiles */}
                <Route path="/photographers" element={<PhotographersPage />} />
                <Route path="/photographer/:id" element={<PhotographerDetailPage />} />

                {/* 1.2 Dedicated Booking Page */}
                <Route path="/bookings" element={<BookingPage />} />

                {/* 2. Protected Studio Workspace (Create Album) - Requires Authentication */}
                <Route
                  path="/app"
                  element={
                    <ProtectedRoute>
                      <StudioWorkspace />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/create"
                  element={
                    <ProtectedRoute>
                      <StudioWorkspace />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/workspace"
                  element={
                    <ProtectedRoute>
                      <StudioWorkspace />
                    </ProtectedRoute>
                  }
                />

                {/* 3. Protected Admin Dashboard - Requires Master Admin / Authenticated User */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* 4. Client Photo Viewing & Selection (Protected by Album Passcode) */}
                <Route path="/album/:id" element={<AlbumView />} />

                {/* 5. Album Management (Protected by Manage Token) */}
                <Route path="/album/:id/manage" element={<AdminManage />} />
              </Routes>
            </main>

            {/* Global Potonow-styled Footer */}
            <Footer />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
