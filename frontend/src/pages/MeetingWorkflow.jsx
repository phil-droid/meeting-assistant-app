import React, { useState, useEffect } from 'react';
import { meetingService, notesService, reportService, suggestionService, chatbotService } from '../services/api';
import ScreenRecorder from '../components/ScreenRecorder';
import toast from 'react-hot-toast';
import { SparklesIcon, CheckCircleIcon, DocumentIcon } from '@heroicons/react/24/outline';

function MeetingWorkflow() {
  const [step, setStep] = useState(1);
  const [meetingData, setMeetingData] = useState({
    title: '',
    description: '',
    participants: [],
    recordingId: null
  });
  const [generatedContent, setGeneratedContent] = useState({
    notes: null,
    report: null,
    suggestions: null
  });
  const [loading, setLoading] = useState(false);

  const steps = [
    { number: 1, title: 'Create Meeting', description: 'Set up your meeting' },
    { number: 2, title: 'Record', description: 'Capture the meeting' },
    { number: 3, title: 'Generate Notes', description: 'AI-powered notes' },
    { number: 4, title: 'Create Report', description: 'Comprehensive report' },
    { number: 5, title: 'Get Suggestions', description: 'AI recommendations' }
  ];

  const handleNextStep = () => {
    if (step < 5) setStep(step + 1);
  };

  const handlePreviousStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Title</label>
              <input
                type="text"
                value={meetingData.title}
                onChange={(e) => setMeetingData({...meetingData, title: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Q4 Planning Meeting"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={meetingData.description}
                onChange={(e) => setMeetingData({...meetingData, description: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                placeholder="Meeting description..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Participants</label>
              <input
                type="text"
                value={meetingData.participants.join(', ')}
                onChange={(e) => setMeetingData({...meetingData, participants: e.target.value.split(',').map(p => p.trim())})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="john@example.com, jane@example.com"
              />
            </div>
          </div>
        );
      case 2:
        return <ScreenRecorder />;
      case 3:
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Meeting Notes</h3>
            {generatedContent.notes ? (
              <div className="bg-gray-50 p-4 rounded max-h-96 overflow-y-auto">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{generatedContent.notes}</p>
              </div>
            ) : (
              <div className="text-center py-8">
                <DocumentIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Notes will be generated here</p>
              </div>
            )}
          </div>
        );
      case 4:
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Meeting Report</h3>
            {generatedContent.report ? (
              <div className="bg-gray-50 p-4 rounded max-h-96 overflow-y-auto">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{generatedContent.report}</p>
              </div>
            ) : (
              <div className="text-center py-8">
                <DocumentIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Report will be generated here</p>
              </div>
            )}
          </div>
        );
      case 5:
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">AI Suggestions</h3>
            {generatedContent.suggestions ? (
              <div className="bg-gray-50 p-4 rounded max-h-96 overflow-y-auto">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{generatedContent.suggestions}</p>
              </div>
            ) : (
              <div className="text-center py-8">
                <SparklesIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Suggestions will be generated here</p>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Meeting Workflow</h1>

      {/* Step Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((s, index) => (
            <div key={s.number} className="flex-1 flex items-center">
              <div
                className={`flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full text-white font-bold ${
                  step >= s.number ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                {step > s.number ? (
                  <CheckCircleIcon className="h-6 w-6" />
                ) : (
                  s.number
                )}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-2 ${
                    step > s.number ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-5 gap-4 text-center text-sm">
          {steps.map(s => (
            <div key={s.number}>
              <p className="font-semibold text-gray-900">{s.title}</p>
              <p className="text-gray-600 text-xs">{s.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="mb-8">
        {renderStep()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={handlePreviousStep}
          disabled={step === 1}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-900 font-bold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <span className="text-gray-600">Step {step} of {steps.length}</span>
        <button
          onClick={handleNextStep}
          disabled={step === 5}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default MeetingWorkflow;
