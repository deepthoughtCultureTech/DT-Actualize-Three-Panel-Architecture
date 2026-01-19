"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Square, Play, Pause, Trash2 } from "lucide-react";

interface AudioRecorderProps {
  fieldId: string;
  value?: string; // URL to existing audio file
  isLocked: boolean;
  onAudioUpload: (fieldId: string, audioBlob: Blob) => void;
  onDelete?: (fieldId: string) => void;
}

export default function AudioRecorder({
  fieldId,
  value,
  isLocked,
  onAudioUpload,
  onDelete,
}: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(value || null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (value) {
      setAudioURL(value);
    }
  }, [value]);

  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        onAudioUpload(fieldId, audioBlob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      setError("Unable to access microphone. Please check your permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleDelete = () => {
    setAudioURL(null);
    setRecordingTime(0);
    if (onDelete) {
      onDelete(fieldId);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (audioURL && !isRecording) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg p-4">
          <button
            type="button"
            onClick={togglePlayback}
            disabled={isLocked}
            className="p-2 bg-green-600 text-white rounded-full hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5" />
            )}
          </button>
          
          <div className="flex-1">
            <p className="text-sm font-medium text-green-800">Audio Recorded</p>
            <audio
              ref={audioRef}
              src={audioURL}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />
            <div className="w-full bg-green-200 rounded-full h-1.5 mt-2">
              <div className="bg-green-600 h-1.5 rounded-full w-0"></div>
            </div>
          </div>

          {!isLocked && (
            <button
              type="button"
              onClick={handleDelete}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete recording"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      
      {!isRecording ? (
        <button
          type="button"
          onClick={startRecording}
          disabled={isLocked}
          className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <Mic className="w-5 h-5" />
          <span className="font-medium">Start Recording</span>
        </button>
      ) : (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 flex-1">
            <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-red-800">
              Recording... {formatTime(recordingTime)}
            </span>
          </div>
          <button
            type="button"
            onClick={stopRecording}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
          >
            <Square className="w-4 h-4" />
            <span className="font-medium">Stop</span>
          </button>
        </div>
      )}

      <p className="text-xs text-gray-500">
        Click the microphone button to start recording your response.
      </p>
    </div>
  );
}
