import React from 'react';
import { Bars3Icon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

function Navbar({ onLogout, sidebarOpen, setSidebarOpen }) {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
        >
          <Bars3Icon className="h-6 w-6 text-gray-900" />
        </button>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Welcome, {user.fullName || 'User'}</h2>
          <p className="text-sm text-gray-600">{new Date().toLocaleDateString()}</p>
        </div>
      </div>

      <button
        onClick={onLogout}
        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <ArrowRightOnRectangleIcon className="h-5 w-5" />
        Logout
      </button>
    </div>
  );
}

export default Navbar;
