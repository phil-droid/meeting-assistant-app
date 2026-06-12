import React, { useEffect, useState } from 'react';
import { meetingService, recordingService, reportService } from '../services/api';
import toast from 'react-hot-toast';
import { ChartBarIcon, VideoCameraIcon, DocumentIcon, SparklesIcon } from '@heroicons/react/24/outline';

function Dashboard() {
  const [stats, setStats] = useState({
    meetings: 0,
    recordings: 0,
    reports: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [meetings, recordings, reports] = await Promise.all([
        meetingService.getAll(),
        recordingService.getAll(),
        reportService.getAll()
      ]);

      setStats({
        meetings: meetings.data.count || 0,
        recordings: recordings.data.count || 0,
        reports: reports.data.count || 0
      });
    } catch (error) {
      toast.error('Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, color }) => (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center">
        <div className={`${color} p-3 rounded-lg`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4">
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
      <p className="text-gray-600 mb-8">Welcome back! Here's an overview of your meetings.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard icon={DocumentIcon} title="Meetings" value={stats.meetings} color="bg-blue-500" />
        <StatCard icon={VideoCameraIcon} title="Recordings" value={stats.recordings} color="bg-green-500" />
        <StatCard icon={ChartBarIcon} title="Reports" value={stats.reports} color="bg-purple-500" />
        <StatCard icon={SparklesIcon} title="AI Suggestions" value="Ready" color="bg-orange-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Start</h2>
          <div className="space-y-3">
            <a href="/meetings" className="block p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
              <p className="font-semibold text-gray-900">📅 Schedule a Meeting</p>
              <p className="text-sm text-gray-600">Create and schedule new meetings</p>
            </a>
            <a href="/recordings" className="block p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
              <p className="font-semibold text-gray-900">🎥 Upload Recording</p>
              <p className="text-sm text-gray-600">Upload and process meeting recordings</p>
            </a>
            <a href="/chatbot" className="block p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
              <p className="font-semibold text-gray-900">🤖 Chat with AI</p>
              <p className="text-sm text-gray-600">Get insights from your meetings</p>
            </a>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Features</h2>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>✅ Screen Recording</li>
            <li>✅ Auto Notes</li>
            <li>✅ Report Generation</li>
            <li>✅ AI Suggestions</li>
            <li>✅ Email Drafts</li>
            <li>✅ AI Chatbot</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
