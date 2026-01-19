"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Square, Play, Pause, Trash2 } from "lucide-react";

interface AudioRecorderProps {
  fieldId: string;
  value: string;
  isLocked: boolean;
  onChange: (fieldId: string, value: string) => void;
  onFileUpload: (fieldId: string, file: File) => void;
}

export default function AudioRecorder({
  fieldId,
  value,
  isLocked,
  onChange,
  onFileUpload,
}: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (value && !audioUrl) {
      setAudioUrl(value);
    }
  }, [value, audioUrl]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const [errorMsg, setErrorMsg] = useState<string>("");

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      setErrorMsg("");

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      setErrorMsg("Could not access microphone. Please check permissions.");
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

  const handleUpload = async () => {
    if (audioBlob) {
      const randomId = Math.random().toString(36).substring(2, 15);
      const file = new File([audioBlob], `audio-${fieldId}-${Date.now()}-${randomId}.webm`, {
        type: "audio/webm",
      });
      await onFileUpload(fieldId, file);
    }
  };

  const handleDelete = () => {
    setAudioBlob(null);
    setAudioUrl("");
    setRecordingTime(0);
    onChange(fieldId, "");
  };

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-4">
      {errorMsg && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {errorMsg}
        </div>
      )}

      {!value && !audioUrl && !isRecording && (
        <button
          type="button"
          onClick={startRecording}
          disabled={isLocked}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition ${
            isLocked ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <Mic className="w-4 h-4" />
          Start Recording
        </button>
      )}

      {isRecording && (
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={stopRecording}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
          >
            <Square className="w-4 h-4" />
            Stop Recording
          </button>
          <span className="text-red-600 font-medium animate-pulse">
            Recording: {formatTime(recordingTime)}
          </span>
        </div>
      )}

      {audioUrl && !value && audioBlob && (
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={togglePlayPause}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-600 text-white hover:bg-gray-700 transition"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Play
                </>
              )}
            </button>
            <audio
              ref={audioRef}
              src={audioUrl}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleUpload}
              disabled={isLocked}
              className={`px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition ${
                isLocked ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Submit Recording
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isLocked}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition ${
                isLocked ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      )}

      {value && (
        <div className="space-y-3">
          <div className="flex items-center justify-between border p-3 rounded-lg bg-green-50">
            <span className="text-sm text-green-700 font-medium">
              ✓ Audio response submitted
            </span>
            {!isLocked && (
              <button
                type="button"
                onClick={handleDelete}
                className="text-red-600 hover:underline text-sm"
              >
                Delete
              </button>
            )}
          </div>
          <audio controls src={value} className="w-full">
            Your browser does not support the audio element.
          </audio>
        </div>
      )}
    </div>
  );
}
