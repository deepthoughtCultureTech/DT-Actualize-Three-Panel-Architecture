"use client";

import { useState } from "react";
import { Ban, X, Clock } from "lucide-react";

interface BlockDurationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (durationHours: number) => void;
  candidateName: string;
  loading?: boolean;
}

export default function BlockDurationModal({
  isOpen,
  onClose,
  onConfirm,
  candidateName,
  loading = false,
}: BlockDurationModalProps) {
  const [blockDuration, setBlockDuration] = useState(24);
  const [customHours, setCustomHours] = useState("");

  if (!isOpen) return null;

  const handleConfirm = () => {
    const duration =
      blockDuration === 0 ? parseInt(customHours) : blockDuration;
    if (!duration || duration <= 0 || duration > 720) return;
    onConfirm(duration);
  };

  const selectedDuration =
    blockDuration === 0 ? parseInt(customHours || "0") : blockDuration;
  const blockExpiryDate = new Date(
    Date.now() + selectedDuration * 60 * 60 * 1000
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl w-full max-w-sm shadow-2xl border border-white/20 max-h-[85vh] overflow-hidden animate-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border-b border-orange-200/50 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-orange-500/10 rounded-2xl border border-orange-500/20">
                <Ban className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Block Candidate
                </h2>
                <p className="text-xs text-orange-700 font-medium">
                  {candidateName}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className="p-1.5 hover:bg-white/50 rounded-xl transition-all duration-200 hover:scale-105 disabled:opacity-50"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Duration Selection */}
        <div className="p-6 space-y-4">
          <div className="text-xs font-medium text-gray-600 text-center mb-4 tracking-wide">
            Select block duration
          </div>

          {/* Duration Buttons */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              { value: 12, label: "12h" },
              { value: 24, label: "24h" },
              { value: 48, label: "48h" },
            ].map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setBlockDuration(value)}
                disabled={loading}
                className={`group relative p-4 rounded-2xl border-2 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 ${
                  blockDuration === value
                    ? "border-orange-400 bg-gradient-to-br from-orange-50 to-orange-100 shadow-orange-200/50"
                    : "border-gray-200 hover:border-gray-300 bg-white/50"
                }`}
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-400/5 to-red-400/5 -inset-px opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10 text-center">
                  <div className="text-lg font-bold text-gray-900">{label}</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {value === 24
                      ? "Recommended"
                      : value > 24
                      ? "2 days"
                      : "Half day"}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Custom Duration */}
          <div className="bg-gradient-to-r from-gray-50/50 to-white/50 border border-gray-200 rounded-2xl p-4 transition-all hover:shadow-md">
            <label
              className="flex items-center gap-3 cursor-pointer w-full" // ✅ Full div clickable
              onClick={() => setBlockDuration(0)} // ✅ Click anywhere on div
            >
              {/* ✅ Radio button aligned with text */}
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                  blockDuration === 0
                    ? "bg-orange-500 border-2 border-orange-500"
                    : "bg-white border-2 border-gray-300 hover:border-gray-400"
                }`}
              >
                {blockDuration === 0 && (
                  <div className="w-2 h-2 rounded-full bg-white" />
                )}
              </div>

              {/* ✅ Text + Input in one line */}
              <div className="flex-1 min-w-0 flex items-center gap-3">
                <div className="text-sm font-semibold text-gray-900 flex-shrink-0">
                  Custom
                </div>
                <input
                  type="number"
                  value={customHours}
                  onChange={(e) => setCustomHours(e.target.value)}
                  placeholder="Enter hours"
                  min="1"
                  max="720"
                  disabled={blockDuration !== 0 || loading}
                  className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
            </label>
          </div>

          {/* Preview */}
          {selectedDuration > 0 && (
            <div className="bg-gradient-to-r from-blue-500/5 to-indigo-500/5 border border-blue-200/50 rounded-2xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-500/10 rounded-xl">
                  <Clock className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-semibold text-gray-700 mb-1">
                    Expires
                  </div>
                  <div className="text-sm font-mono font-semibold text-gray-900">
                    {blockExpiryDate.toLocaleString("en-IN", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                  <div className="text-xs text-blue-600 mt-1">
                    {selectedDuration}h total
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-5 border-t bg-gradient-to-r from-gray-50/80 to-white/80 backdrop-blur-sm">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white/50 hover:bg-white border border-gray-200 rounded-xl transition-all hover:shadow-md hover:scale-[1.02] disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading || selectedDuration <= 0}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg hover:shadow-xl hover:scale-[1.02] rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/80 border-t-transparent rounded-full animate-spin" />
                Blocking...
              </>
            ) : (
              <>
                <Ban className="w-4 h-4" />
                Block Now
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
