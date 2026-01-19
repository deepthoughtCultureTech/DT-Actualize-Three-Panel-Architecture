"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, CheckCircle } from "lucide-react";
import { WatchBeforeYouBegin } from "@/types/process";

interface WatchBeforeYouBeginModalProps {
  videoConfig: WatchBeforeYouBegin;
  onComplete: () => void;
  processId: string;
}

export function WatchBeforeYouBeginModal({
  videoConfig,
  onComplete,
  processId,
}: WatchBeforeYouBeginModalProps) {
  const [timeWatched, setTimeWatched] = useState(0);
  const [canSkip, setCanSkip] = useState(!videoConfig.isMandatory);
  const [isComplete, setIsComplete] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // For mandatory videos, require watching for at least 90% of duration
  const REQUIRED_WATCH_PERCENTAGE = 0.9;

  // Helper function to parse video duration safely
  const parseVideoDuration = (duration: string | undefined): number | null => {
    if (!duration) return null;
    const parts = duration.split(":");
    if (parts.length !== 2) return null;
    const mins = parseInt(parts[0], 10);
    const secs = parseInt(parts[1], 10);
    if (isNaN(mins) || isNaN(secs)) return null;
    return mins * 60 + secs;
  };

  useEffect(() => {
    // Check if user has already watched this video
    const watchedKey = `watched-${processId}`;
    const hasWatched = localStorage.getItem(watchedKey);
    if (hasWatched === "true") {
      setCanSkip(true);
      setIsComplete(true);
    }
  }, [processId]);

  useEffect(() => {
    if (isPlaying && videoConfig.isMandatory) {
      timerRef.current = setInterval(() => {
        setTimeWatched((prev) => {
          const newTime = prev + 1;
          // If video duration is provided, calculate required watch time
          const totalSeconds = parseVideoDuration(videoConfig.videoDuration);
          if (totalSeconds) {
            const requiredTime = totalSeconds * REQUIRED_WATCH_PERCENTAGE;
            
            if (newTime >= requiredTime) {
              setCanSkip(true);
              if (timerRef.current) clearInterval(timerRef.current);
            }
          }
          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, videoConfig.isMandatory, videoConfig.videoDuration]);

  const handleClose = () => {
    if (canSkip) {
      const watchedKey = `watched-${processId}`;
      localStorage.setItem(watchedKey, "true");
      setIsComplete(true);
      onComplete();
    }
  };

  const handleVideoEnd = () => {
    setCanSkip(true);
    setIsComplete(true);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const getEmbedUrl = (url: string) => {
    // YouTube
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      const videoId = url.includes("youtube.com")
        ? url.split("v=")[1]?.split("&")[0]
        : url.split("youtu.be/")[1]?.split("?")[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1&modestbranding=1&rel=0`;
    }
    // Vimeo
    if (url.includes("vimeo.com")) {
      const videoId = url.split("vimeo.com/")[1]?.split("?")[0];
      return `https://player.vimeo.com/video/${videoId}?autoplay=1`;
    }
    // Direct video file
    return url;
  };

  const isDirectVideo = (url: string) => {
    return url.endsWith(".mp4") || url.endsWith(".webm") || url.endsWith(".ogg");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (isComplete && canSkip) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Play className="w-6 h-6" />
                  Watch Before You Begin
                </h2>
                <p className="text-blue-100 text-sm mt-1">
                  {videoConfig.videoTitle}
                </p>
              </div>
              <button
                onClick={handleClose}
                disabled={!canSkip}
                className={`p-2 rounded-lg transition-all ${
                  canSkip
                    ? "hover:bg-white/20 cursor-pointer"
                    : "opacity-40 cursor-not-allowed"
                }`}
                title={canSkip ? "Close" : "Please watch the video to continue"}
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Video Container */}
          <div className="relative bg-black" style={{ paddingBottom: "56.25%" }}>
            {isDirectVideo(videoConfig.videoUrl) ? (
              <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full"
                src={videoConfig.videoUrl}
                controls={!videoConfig.isMandatory || canSkip}
                autoPlay
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={handleVideoEnd}
                controlsList={videoConfig.isMandatory && !canSkip ? "nodownload nofullscreen noremoteplayback" : ""}
              />
            ) : (
              <iframe
                className="absolute inset-0 w-full h-full"
                src={getEmbedUrl(videoConfig.videoUrl)}
                title={videoConfig.videoTitle}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>

          {/* Description & Progress */}
          <div className="px-6 py-4 bg-gray-50 space-y-3">
            <p className="text-sm text-gray-700">{videoConfig.videoDescription}</p>

            {videoConfig.isMandatory && !canSkip && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Required watch time
                  </span>
                  <span className="text-sm font-bold text-blue-600">
                    {formatTime(timeWatched)}
                    {videoConfig.videoDuration && ` / ${videoConfig.videoDuration}`}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                    initial={{ width: 0 }}
                    animate={{
                      width: (() => {
                        const totalSeconds = parseVideoDuration(videoConfig.videoDuration);
                        if (!totalSeconds) return "0%";
                        const requiredTime = totalSeconds * REQUIRED_WATCH_PERCENTAGE;
                        return `${Math.min((timeWatched / requiredTime) * 100, 100)}%`;
                      })(),
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            )}

            {canSkip && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">
                  You can now continue with your process
                </span>
              </div>
            )}

            <button
              onClick={handleClose}
              disabled={!canSkip}
              className={`w-full mt-4 py-3 rounded-lg font-semibold transition-all ${
                canSkip
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {canSkip ? "Continue to Process" : "Watch video to continue"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
