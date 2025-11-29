import React, { useState } from "react";
import { formatEndTime } from "../../lib/utils";

interface TimerModalProps {
  isOpen: boolean;
  onTimelineSet: (timelineData: {
    timeline: string;
    timelineDate: string;
  }) => void;
  isSubmitting?: boolean;
}

const TimerModal: React.FC<TimerModalProps> = ({
  isOpen,
  onTimelineSet,
  isSubmitting,
}) => {
  const [customHours, setCustomHours] = useState<number>(24);

  const handleSetTimeline = () => {
    // ✅ Create deadline in UTC (works everywhere)

    const endTime = new Date(Date.now() + customHours * 60 * 60 * 1000);

    // ✅ Format for display in IST
    const formattedIST = endTime.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    // ✅ Send both ISO and formatted
    onTimelineSet({
      timeline: formattedIST,
      timelineDate: endTime.toISOString(),
    });
  };

  const quickOptions = [
    { label: "6h", value: 6 },
    { label: "12h", value: 12 },
    { label: "24h", value: 24 },
    { label: "36h", value: 36 },
    { label: "48h", value: 48 },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-md w-full text-center space-y-8 border border-gray-100">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">
            Self-Defined Timeline
          </h2>
          <p className="text-gray-500 text-sm">
            Choose how long you need for this challenge
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap justify-center gap-2">
            {quickOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setCustomHours(option.value)}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  customHours === option.value
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25 scale-105"
                    : "bg-gray-50 text-gray-700 hover:bg-gray-100 hover:scale-105"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-4 border border-blue-100">
          <p className="text-sm text-gray-600 mb-1">Your timeline will end:</p>
          <p className="text-lg font-bold text-gray-900">
            {formatEndTime(customHours)}
          </p>
        </div>

        <div className="space-y-4">
          <p className="text-sm font-medium text-gray-700">Or customize:</p>
          <div className="space-y-3">
            <div className="flex items-center justify-center space-x-4">
              <span className="text-sm text-gray-500 min-w-[20px]">1h</span>
              <input
                type="range"
                min="1"
                max="48"
                value={customHours}
                onChange={(e) => setCustomHours(Number(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-full appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #2563eb 0%, #2563eb ${
                    ((customHours - 1) / 47) * 100
                  }%, #e5e7eb ${
                    ((customHours - 1) / 47) * 100
                  }%, #e5e7eb 100%)`,
                }}
              />
              <span className="text-sm text-gray-500 min-w-[25px]">48h</span>
            </div>
            <div className="text-center">
              <span className="text-2xl font-bold text-blue-600">
                {customHours}
              </span>
              <span className="text-sm text-gray-500 ml-1">hours</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleSetTimeline}
          disabled={isSubmitting}
          className={`w-full px-6 py-4 rounded-2xl font-semibold transition-all duration-200 shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/30 hover:scale-[1.02] ${
            isSubmitting
              ? "bg-secondary cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-800 cursor-pointer text-white"
          }`}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              Submitting...
            </span>
          ) : (
            "Submit"
          )}
        </button>
      </div>
    </div>
  );
};

export default TimerModal;
