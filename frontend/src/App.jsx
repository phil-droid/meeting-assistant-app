import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

import Dashboard from './pages/Dashboard';
import Meetings from './pages/Meetings';
import Recordings from './pages/Recordings';
import Reports from './pages/Reports';
import ChatBot from './pages/ChatBot';
import MeetingDetail from './pages/MeetingDetail';

import api from './api/client';
import './index.css';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  /**
   * Backend health check (safe dev debug)
   */
  useEffect(() => {
    const testBackend = async () => {
      try {
        const res = await api.get('/health');
        console.log('✅ Backend connected:', res.data);
      } catch (err) {
        console.error('❌ Backend connection failed:', err.message);
      }
    };

    testBackend();
  }, []);

  const handleLogout = () => {
    console.log('Logout disabled (auth removed)');
  };

  return (
    <Router>
      <div className="flex h-screen bg-gray-50">
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar
            onLogout={handleLogout}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />

          <main className="flex-1 overflow-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/meetings" element={<Meetings />} />
              <Route path="/meetings/:id" element={<MeetingDetail />} />
              <Route path="/recordings" element={<Recordings />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/chatbot" element={<ChatBot />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;