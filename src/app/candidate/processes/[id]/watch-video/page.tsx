"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Play, CheckCircle } from "lucide-react";

interface WatchBeforeBeginConfig {
  videoUrl: string;
  title: string;
  description: string;
  mandatory: boolean;
}

interface Process {
  _id: string;
  title: string;
  watchBeforeBegin?: WatchBeforeBeginConfig;
  rounds: any[];
}

export default function WatchVideoPage() {
  const params = useParams<{ id: string }>();
  const processId = params.id;
  const router = useRouter();

  const [process, setProcess] = useState<Process | null>(null);
  const [loading, setLoading] = useState(true);
  const [videoCompleted, setVideoCompleted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    async function fetchProcess() {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`/api/candidate/processes/${processId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch process");
        const data = await res.json();
        setProcess(data);

        // Check if video was already watched
        const watchedKey = `watched_video_${processId}`;
        const hasWatched = localStorage.getItem(watchedKey);
        if (hasWatched) {
          setVideoCompleted(true);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (processId) fetchProcess();
  }, [processId]);

  const handleVideoEnd = () => {
    setVideoCompleted(true);
    // Save to localStorage
    const watchedKey = `watched_video_${processId}`;
    localStorage.setItem(watchedKey, "true");
  };

  const handleStart = () => {
    if (!process) return;
    const firstRound = process.rounds.sort((a, b) => a.order - b.order)[0];
    if (firstRound) {
      router.push(`/candidate/processes/${processId}/round/${firstRound._id}`);
    }
  };

  const handleSkip = () => {
    handleStart();
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-b from-sky-500 to-blue-900">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  if (!process || !process.watchBeforeBegin) {
    // No video configured, redirect to first round
    handleStart();
    return null;
  }

  const { watchBeforeBegin } = process;

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-500 to-blue-900 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl bg-white p-6 shadow-2xl md:p-8"
        >
          {/* Header */}
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold text-slate-900">
              {watchBeforeBegin.title}
            </h1>
            {watchBeforeBegin.description && (
              <p className="mt-2 text-sm text-slate-600">
                {watchBeforeBegin.description}
              </p>
            )}
            {watchBeforeBegin.mandatory && (
              <p className="mt-2 text-xs font-medium text-amber-600">
                ⚠️ This video is mandatory. You must watch it completely before starting.
              </p>
            )}
          </div>

          {/* Video Player */}
          <div className="mb-6">
            <div className="overflow-hidden rounded-lg bg-black">
              <video
                ref={videoRef}
                src={watchBeforeBegin.videoUrl}
                controls
                controlsList={watchBeforeBegin.mandatory ? "nodownload nofullscreen" : undefined}
                onEnded={handleVideoEnd}
                className="w-full"
              >
                Your browser does not support the video element.
              </video>
            </div>
          </div>

          {/* Completion Status */}
          {videoCompleted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 flex items-center justify-center gap-2 rounded-lg bg-emerald-50 p-4 text-emerald-700"
            >
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">
                You&apos;ve successfully watched the instruction video.
              </span>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            {!watchBeforeBegin.mandatory && !videoCompleted && (
              <button
                onClick={handleSkip}
                className="rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Skip Video
              </button>
            )}
            <button
              onClick={handleStart}
              disabled={watchBeforeBegin.mandatory && !videoCompleted}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 text-sm font-medium text-white shadow-md hover:scale-105 transition disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
            >
              <Play className="h-4 w-4" />
              Start Process
            </button>
          </div>

          {watchBeforeBegin.mandatory && !videoCompleted && (
            <p className="mt-4 text-center text-xs text-slate-500">
              The start button will be enabled after you watch the video.
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
