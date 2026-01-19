"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { X, Video } from "lucide-react";

interface WatchBeforeBeginConfig {
  videoUrl: string;
  title: string;
  description: string;
  mandatory: boolean;
}

export default function WatchBeforeBeginPage() {
  const params = useParams<{ id: string }>();
  const processId = params.id;
  const router = useRouter();

  const [config, setConfig] = useState<WatchBeforeBeginConfig>({
    videoUrl: "",
    title: "",
    description: "",
    mandatory: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProcess() {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`/api/admin/process/${processId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch process");
        const data = await res.json();
        if (data.watchBeforeBegin) {
          setConfig(data.watchBeforeBegin);
        }
      } catch (err) {
        console.error(err);
        setErrorMsg("Failed to load process data");
      } finally {
        setLoading(false);
      }
    }
    if (processId) fetchProcess();
  }, [processId]);

  const handleVideoUpload = async (file: File) => {
    setUploading(true);
    setErrorMsg(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "video");

      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setConfig((prev) => ({ ...prev, videoUrl: data.url }));
      setSuccessMsg("Video uploaded successfully");
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to upload video");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/admin/process/${processId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ watchBeforeBegin: config }),
      });

      if (!res.ok) throw new Error("Failed to save configuration");
      setSuccessMsg("Configuration saved successfully");
      setTimeout(() => {
        router.push(`/admin/processes/${processId}`);
      }, 1500);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to save configuration");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <div className="h-6 w-48 animate-pulse rounded bg-slate-200" />
        <div className="mt-4 h-64 w-full animate-pulse rounded bg-slate-200" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl p-4 md:p-8">
      <h1 className="text-2xl font-semibold text-slate-900">
        Watch Before You Begin
      </h1>
      <p className="mt-1 text-sm text-slate-600">
        Configure an introductory video for candidates to watch before starting the process.
      </p>

      {errorMsg && (
        <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {successMsg}
        </div>
      )}

      <div className="mt-6 space-y-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        {/* Video Upload */}
        <div>
          <label className="block text-sm font-medium text-slate-800">
            Video <span className="text-rose-600">*</span>
          </label>
          <p className="mt-1 text-xs text-slate-500">
            Upload a video file, or enter a YouTube/Vimeo URL
          </p>
          
          {config.videoUrl ? (
            <div className="mt-2 space-y-2">
              <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center gap-2">
                  <Video className="h-4 w-4 text-slate-600" />
                  <span className="text-sm text-slate-700">Video uploaded</span>
                </div>
                <button
                  type="button"
                  onClick={() => setConfig((prev) => ({ ...prev, videoUrl: "" }))}
                  className="text-rose-600 hover:text-rose-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <video controls src={config.videoUrl} className="w-full rounded-lg">
                Your browser does not support the video element.
              </video>
            </div>
          ) : (
            <div className="mt-2 space-y-2">
              <input
                type="file"
                accept="video/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleVideoUpload(file);
                }}
                disabled={uploading}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
              <div className="text-center text-xs text-slate-500">or</div>
              <input
                type="url"
                placeholder="Enter YouTube or Vimeo URL"
                value={config.videoUrl}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, videoUrl: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
          )}
          {uploading && (
            <p className="mt-2 text-xs text-blue-600">Uploading video...</p>
          )}
        </div>

        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-slate-800">
            Video Title <span className="text-rose-600">*</span>
          </label>
          <input
            id="title"
            type="text"
            value={config.title}
            onChange={(e) =>
              setConfig((prev) => ({ ...prev, title: e.target.value }))
            }
            placeholder="e.g. Welcome to our recruitment process"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            maxLength={120}
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-slate-800">
            Description
          </label>
          <textarea
            id="description"
            value={config.description}
            onChange={(e) =>
              setConfig((prev) => ({ ...prev, description: e.target.value }))
            }
            placeholder="Brief description of what the video covers"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            rows={3}
            maxLength={500}
          />
        </div>

        {/* Mandatory checkbox */}
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="mandatory"
            checked={config.mandatory}
            onChange={(e) =>
              setConfig((prev) => ({ ...prev, mandatory: e.target.checked }))
            }
            className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
          />
          <div>
            <label htmlFor="mandatory" className="text-sm font-medium text-slate-800">
              Mark as Mandatory
            </label>
            <p className="text-xs text-slate-500">
              Candidates must watch the entire video before starting
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-4">
          <button
            type="button"
            onClick={() => router.push(`/admin/processes/${processId}`)}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !config.videoUrl || !config.title}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Configuration"}
          </button>
        </div>
      </div>
    </div>
  );
}
