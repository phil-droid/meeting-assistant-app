import React, { useEffect, useState } from 'react';
import { recordingService } from '../services/api';
import toast from 'react-hot-toast';
import { PlusIcon, TrashIcon, VideoCameraIcon } from '@heroicons/react/24/outline';
import { formatDate } from '../utils/helpers';

function Recordings() {
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    meetingId: '',
    title: '',
    file: null
  });

  useEffect(() => {
    fetchRecordings();
  }, []);

  const fetchRecordings = async () => {
    try {
      const response = await recordingService.getAll();
      setRecordings(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch recordings');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setFormData({...formData, file: e.target.files[0]});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.file) {
      toast.error('Please select a file');
      return;
    }

    setUploading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('recording', formData.file);
      formDataToSend.append('meetingId', formData.meetingId || 'unknown');
      formDataToSend.append('title', formData.title || formData.file.name);

      await recordingService.upload(formDataToSend);
      toast.success('Recording uploaded successfully');
      setShowModal(false);
      setFormData({ meetingId: '', title: '', file: null });
      fetchRecordings();
    } catch (error) {
      toast.error('Failed to upload recording');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this recording?')) {
      try {
        await recordingService.delete(id);
        toast.success('Recording deleted');
        fetchRecordings();
      } catch (error) {
        toast.error('Failed to delete recording');
      }
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Recordings</h1>
          <p className="text-gray-600 mt-1">Manage your meeting recordings</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          Upload Recording
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : recordings.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <VideoCameraIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No recordings yet. Upload one to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recordings.map((recording) => (
            <div key={recording.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <VideoCameraIcon className="h-6 w-6 text-blue-600" />
                <button
                  onClick={() => handleDelete(recording.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{recording.title}</h3>
              <p className="text-sm text-gray-600 mb-2">Size: {(recording.size / 1024 / 1024).toFixed(2)} MB</p>
              <p className="text-sm text-gray-600 mb-4">Uploaded: {formatDate(recording.uploadedAt)}</p>
              <div className="flex items-center gap-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{width: '100%'}}></div>
                </div>
                <span className="text-xs text-gray-600 whitespace-nowrap">100%</span>
              </div>
              <p className="text-xs text-center mt-2 px-3 py-1 bg-blue-100 text-blue-800 rounded">
                {recording.status}
              </p>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Upload Recording</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Recording title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meeting ID (optional)</label>
                <input
                  type="text"
                  value={formData.meetingId}
                  onChange={(e) => setFormData({...formData, meetingId: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Meeting ID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select File</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-colors">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept="video/*,audio/*"
                    className="hidden"
                    id="file-input"
                  />
                  <label htmlFor="file-input" className="cursor-pointer">
                    {formData.file ? (
                      <p className="text-gray-900 font-semibold">{formData.file.name}</p>
                    ) : (
                      <div>
                        <p className="text-gray-600">Drop file here or click to upload</p>
                        <p className="text-sm text-gray-500">MP4, WebM, or MP3</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 rounded-lg"
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 font-bold py-2 rounded-lg">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Recordings;
