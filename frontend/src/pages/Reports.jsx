import React, { useEffect, useState } from 'react';
import { reportService, suggestionService } from '../services/api';
import toast from 'react-hot-toast';
import { DocumentIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { formatDate } from '../utils/helpers';

function Reports() {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
    fetchSuggestions();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await reportService.getAll();
      setReports(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestions = async () => {
    try {
      const response = await suggestionService.getAll();
      setSuggestions(response.data.data || []);
    } catch (error) {
      console.log('No suggestions yet');
    }
  };

  return (
    <div className="p-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reports & Insights</h1>
        <p className="text-gray-600 mt-1">View generated reports and AI suggestions</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <DocumentIcon className="h-6 w-6" />
                  Generated Reports
                </h2>
              </div>
              <div className="divide-y">
                {reports.length === 0 ? (
                  <div className="p-6 text-center text-gray-600">
                    No reports generated yet
                  </div>
                ) : (
                  reports.map((report) => (
                    <div
                      key={report.id}
                      onClick={() => setSelectedReport(report)}
                      className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <h3 className="font-bold text-gray-900 mb-1">{report.title}</h3>
                      <p className="text-sm text-gray-600">Generated: {formatDate(report.generatedAt)}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <SparklesIcon className="h-6 w-6" />
                  AI Suggestions
                </h2>
              </div>
              <div className="divide-y max-h-96 overflow-y-auto">
                {suggestions.length === 0 ? (
                  <div className="p-6 text-center text-gray-600">
                    No suggestions yet
                  </div>
                ) : (
                  suggestions.map((suggestion) => (
                    <div key={suggestion.id} className="p-4 text-sm text-gray-700">
                      <p className="font-semibold text-gray-900 mb-1">Generated: {formatDate(suggestion.generatedAt)}</p>
                      <p className="line-clamp-3">{suggestion.content}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-96 overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-gray-900">{selectedReport.title}</h2>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="prose prose-sm max-w-none">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedReport.content}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Reports;
