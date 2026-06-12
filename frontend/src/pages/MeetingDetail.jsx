import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { meetingService, recordingService, notesService, reportService, emailService } from '../services/api';
import toast from 'react-hot-toast';
import { ArrowLeftIcon, VideoCameraIcon, DocumentIcon, SparklesIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import { formatDate } from '../utils/helpers';
import { useNavigate } from 'react-router-dom';

function MeetingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState(null);
  const [recordings, setRecordings] = useState([]);
  const [notes, setNotes] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchMeetingDetails();
  }, [id]);

  const fetchMeetingDetails = async () => {
    try {
      const [meetingRes, recordingsRes] = await Promise.all([
        meetingService.getById(id),
        recordingService.getAll()
      ]);
      
      setMeeting(meetingRes.data.data);
      const meetingRecordings = recordingsRes.data.data.filter(r => r.meetingId === id);
      setRecordings(meetingRecordings);
    } catch (error) {
      toast.error('Failed to fetch meeting details');
      navigate('/meetings');
    } finally {
      setLoading(false);
    }
  };

  const generateNotes = async () => {
    if (recordings.length === 0) {
      toast.error('No recordings found for this meeting');
      return;
    }
    try {
      const response = await notesService.generate({
        recordingId: recordings[0].id,
        meetingId: id,
        transcript: 'Sample transcript from recording'
      });
      setNotes(response.data.data);
      toast.success('Notes generated successfully');
    } catch (error) {
      toast.error('Failed to generate notes');
    }
  };

  const generateReport = async () => {
    if (!notes) {
      toast.error('Please generate notes first');
      return;
    }
    try {
      const response = await reportService.generate({
        meetingId: id,
        meetingTitle: meeting.title,
        notes: notes.content,
        attendees: meeting.participants
      });
      setReport(response.data.data);
      toast.success('Report generated successfully');
    } catch (error) {
      toast.error('Failed to generate report');
    }
  };

  const draftEmail = async () => {
    try {
      const response = await emailService.generateDraft({
        meetingTitle: meeting.title,
        attendees: meeting.participants,
        meetingNotes: notes?.content || '',
        actionItems: 'Action items from meeting',
        recipientEmail: 'team@example.com'
      });
      toast.success('Email draft created successfully');
    } catch (error) {
      toast.error('Failed to draft email');
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (!meeting) {
    return <div className="p-8 text-center">Meeting not found</div>;
  }

  return (
    <div className="p-8">
      <button onClick={() => navigate('/meetings')} className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4">
        <ArrowLeftIcon className="h-5 w-5" />
        Back to Meetings
      </button>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{meeting.title}</h1>
        <p className="text-gray-600 mb-4">{meeting.description}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Scheduled:</p>
            <p className="font-semibold text-gray-900">{formatDate(meeting.scheduledFor)}</p>
          </div>
          <div>
            <p className="text-gray-600">Participants:</p>
            <p className="font-semibold text-gray-900">{meeting.participants?.length || 0} people</p>
          </div>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <button onClick={generateNotes} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
          <DocumentIcon className="h-5 w-5" />
          Generate Notes
        </button>
        <button onClick={generateReport} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg">
          <SparklesIcon className="h-5 w-5" />
          Generate Report
        </button>
        <button onClick={draftEmail} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg">
          <EnvelopeIcon className="h-5 w-5" />
          Draft Email
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {recordings.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <VideoCameraIcon className="h-6 w-6" />
              Recordings
            </h2>
            <div className="space-y-3">
              {recordings.map(recording => (
                <div key={recording.id} className="border border-gray-200 rounded p-3">
                  <p className="font-semibold text-gray-900">{recording.title}</p>
                  <p className="text-sm text-gray-600">Status: {recording.status}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {notes && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <DocumentIcon className="h-6 w-6" />
              Meeting Notes
            </h2>
            <div className="bg-gray-50 p-4 rounded max-h-96 overflow-y-auto">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{notes.content}</p>
            </div>
          </div>
        )}

        {report && (
          <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <SparklesIcon className="h-6 w-6" />
              Meeting Report
            </h2>
            <div className="bg-gray-50 p-4 rounded max-h-96 overflow-y-auto">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{report.content}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MeetingDetail;
