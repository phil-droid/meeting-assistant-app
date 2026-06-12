import React, { useState, useRef, useEffect } from 'react';
import { recordingService } from '../services/api';
import toast from 'react-hot-toast';
import { PlayIcon, StopIcon, PauseIcon, VideoCameraIcon } from '@heroicons/react/24/outline';

function ScreenRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: 'always'
        },
        audio: false
      });

      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
      });

      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        await uploadRecording(blob);
        stream.getTracks().forEach(track => track.stop());
        setDuration(0);
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      setIsPaused(false);

      // Start timer
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);

      toast.success('Screen recording started');
    } catch (error) {
      if (error.name !== 'NotAllowedError') {
        toast.error('Failed to start recording: ' + error.message);
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    }
  };

  const uploadRecording = async (blob) => {
    try {
      const formData = new FormData();
      formData.append('recording', blob);
      formData.append('title', `Screen Recording ${new Date().toISOString()}`);
      formData.append('meetingId', 'current-meeting');

      await recordingService.upload(formData);
      toast.success('Recording uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload recording');
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <VideoCameraIcon className="h-6 w-6" />
        Screen Recorder
      </h2>

      <div className="flex items-center justify-between mb-6">
        <div className="text-4xl font-mono font-bold text-gray-900">
          {formatTime(duration)}
        </div>
        {isRecording && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
            <span className="text-red-600 font-semibold">RECORDING</span>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        {!isRecording ? (
          <button
            onClick={startRecording}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            <PlayIcon className="h-5 w-5" />
            Start Recording
          </button>
        ) : (
          <>
            {!isPaused ? (
              <button
                onClick={pauseRecording}
                className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                <PauseIcon className="h-5 w-5" />
                Pause
              </button>
            ) : (
              <button
                onClick={resumeRecording}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                <PlayIcon className="h-5 w-5" />
                Resume
              </button>
            )}
            <button
              onClick={stopRecording}
              className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              <StopIcon className="h-5 w-5" />
              Stop
            </button>
          </>
        )}
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-900">
          💡 <strong>Tip:</strong> Make sure to allow screen sharing permissions when prompted. You can record your entire screen or a specific window.
        </p>
      </div>
    </div>
  );
}

export default ScreenRecorder;
