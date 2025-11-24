"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import {
  AlertTriangle,
  Clock,
  Ban,
  RefreshCw,
  Unlock,
  View,
  Eye,
} from "lucide-react";
import BlockDurationModal from "@/components/admin/BlockDurationModal";

const PURPLE = "#3E00FF";

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "completed":
      return (
        <span className="inline-flex items-center bg-green-500 rounded-full px-6 py-1 text-xs font-medium text-white">
          Completed
        </span>
      );
    case "in-progress":
      return (
        <span
          className="inline-flex items-center rounded-full px-6 py-1 text-xs font-medium text-white"
          style={{ backgroundColor: PURPLE }}
        >
          In Progress
        </span>
      );
    case "expired":
      return (
        <span className="inline-flex items-center bg-red-500 rounded-full px-6 py-1 text-xs font-medium text-white">
          Expired
        </span>
      );
    case "blocked":
      return (
        <span className="inline-flex items-center bg-orange-500 rounded-full px-6 py-1 text-xs font-medium text-white">
          Blocked
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center rounded-full border px-6 py-1 text-xs font-medium text-gray-700 border-gray-300 bg-white">
          Applied
        </span>
      );
  }
}

// ✅ Enhanced Round Progress Component
function RoundProgress({
  progress,
  currentRound,
}: {
  progress: { current: number; total: number; percentage: number } | null;
  currentRound: any;
}) {
  if (!progress) {
    return <span className="text-xs text-gray-400">-</span>;
  }

  if (progress.percentage === 100) {
    return (
      <div className="flex flex-col items-center gap-1">
        <span className="text-xs font-semibold text-green-600">✓ Complete</span>
        <span className="text-xs text-gray-500">
          {progress.total}/{progress.total}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1.5 min-w-[120px]">
      <div className="text-xs font-medium text-gray-700">
        {progress.current}/{progress.total} Rounds
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1.5">
        <div
          className="bg-blue-600 h-1.5 rounded-full transition-all"
          style={{ width: `${progress.percentage}%` }}
        />
      </div>
      {currentRound && (
        <span className="text-xs text-gray-500">{currentRound.title}</span>
      )}
    </div>
  );
}

// ✅ Enhanced Timeline Status Component
function TimelineStatus({
  hasExpired,
  currentRound,
  timeRemaining,
}: {
  hasExpired: boolean;
  currentRound: any;
  timeRemaining: any;
}) {
  if (!currentRound || !currentRound.timeline) {
    return <span className="text-xs text-gray-400">No deadline</span>;
  }

  if (hasExpired) {
    return (
      <div className="flex flex-col items-center gap-1">
        <div className="flex items-center gap-1 text-red-600">
          <AlertTriangle className="w-4 h-4" />
          <span className="text-xs font-semibold">Expired</span>
        </div>
        <span className="text-xs text-gray-500">
          {new Date(currentRound.timelineDate).toLocaleDateString()}
        </span>
      </div>
    );
  }

  if (timeRemaining && !timeRemaining.expired) {
    const isUrgent = timeRemaining.days === 0 && timeRemaining.hours < 6;

    return (
      <div className="flex flex-col items-center gap-1">
        <div
          className={`flex items-center gap-1 ${
            isUrgent ? "text-orange-600" : "text-green-600"
          }`}
        >
          <Clock className="w-4 h-4" />
          <span className="text-xs font-medium">
            {timeRemaining.days > 0 && `${timeRemaining.days}d `}
            {timeRemaining.hours}h {timeRemaining.minutes}m
          </span>
        </div>
        <span className="text-xs text-gray-500">
          {new Date(currentRound.timelineDate).toLocaleDateString()}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <span className="text-xs text-gray-600">
        {new Date(currentRound.timelineDate).toLocaleDateString()}
      </span>
    </div>
  );
}

export default function ApplicantsPage() {
  const [applicants, setApplicants] = useState([]);
  const [processHeading, setProcessHeading] = useState("");
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [blockingId, setBlockingId] = useState<string | null>(null);
  const [unblockingId, setUnblockingId] = useState<string | null>(null);

  // ✅ Modal state
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<any>(null);

  const router = useRouter();
  const { id } = useParams();

  const fetchData = async () => {
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const response = await axios({
        url: `/api/admin/process/applications/${id}`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const processedApplicants = response.data.applications.map(
        (applicant: any) => {
          return {
            id: applicant.candidateId,
            applicationId: applicant._id,
            email: applicant.candidate.email,
            status: applicant.status,
            name: applicant.candidate.name,
            roundProgress: applicant.roundProgress,
            currentRound: applicant.currentRound,
            hasExpiredTimeline: applicant.hasExpiredTimeline,
            expiredRoundsCount: applicant.expiredRoundsCount,
            timeRemaining: applicant.timeRemaining,
          };
        }
      );

      setProcessHeading(response.data.process.title);
      setApplicants(processedApplicants);
    } catch (error) {
      console.error("Error fetching applicants:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // ✅ Auto-refresh every minute
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [id]);

  // ✅ Open block modal
  const openBlockModal = (
    candidateId: string,
    name: string,
    applicationId: string
  ) => {
    setSelectedApplicant({ candidateId, name, applicationId });
    setShowBlockModal(true);
  };

  // ✅ Handle block confirmation from modal
  const handleBlockConfirm = async (durationHours: number) => {
    if (!selectedApplicant) return;

    setBlockingId(selectedApplicant.candidateId);

    try {
      const token = localStorage.getItem("token");
      const response = await axios({
        url: `/api/admin/applications/${selectedApplicant.applicationId}`,
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        data: {
          action: "blockCandidate",
          blockDurationHours: durationHours,
          reason: "Missed self-defined timeline",
        },
      });

      if (response.data.success) {
        const durationText =
          durationHours >= 24
            ? `${Math.floor(durationHours / 24)} day(s) ${durationHours % 24}h`
            : `${durationHours} hour(s)`;

        alert(
          `${
            selectedApplicant.name
          } has been blocked for ${durationText}\n\nBlocked until: ${new Date(
            response.data.blockedUntil
          ).toLocaleString()}`
        );

        setShowBlockModal(false);
        setSelectedApplicant(null);
        fetchData();
      }
    } catch (err: any) {
      console.error("Error blocking candidate:", err);
      alert(err.response?.data?.error || "Failed to block candidate");
    } finally {
      setBlockingId(null);
    }
  };

  // ✅ Handle unblock
  const handleUnblock = async (
    candidateId: string,
    applicationId: string,
    name: string
  ) => {
    const confirmed = window.confirm(
      `Are you sure you want to unblock ${name}?\n\nThis will restore their access immediately.`
    );

    if (!confirmed) return;

    setUnblockingId(candidateId);

    try {
      const token = localStorage.getItem("token");
      const response = await axios({
        url: `/api/admin/applications/${applicationId}`,
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        data: {
          action: "unblockCandidate",
        },
      });

      if (response.data.success) {
        alert(`${name} has been unblocked successfully.`);
        fetchData();
      }
    } catch (err: any) {
      console.error("Error unblocking candidate:", err);
      alert(err.response?.data?.error || "Failed to unblock candidate");
    } finally {
      setUnblockingId(null);
    }
  };

  // ✅ Filter applicants
  const filteredApplicants = applicants.filter((a: any) => {
    if (filterStatus === "expired") return a.hasExpiredTimeline;
    if (filterStatus === "active")
      return !a.hasExpiredTimeline && a.currentRound?.timeline;
    if (filterStatus === "all") return true;
    return a.status === filterStatus;
  });

  // ✅ Count statistics
  const expiredCount = applicants.filter(
    (a: any) => a.hasExpiredTimeline
  ).length;
  const inProgressCount = applicants.filter(
    (a: any) => a.status === "in-progress"
  ).length;
  const completedCount = applicants.filter(
    (a: any) => a.status === "completed"
  ).length;
  const blockedCount = applicants.filter(
    (a: any) => a.status === "blocked"
  ).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Applicants...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Page header */}
      <header className="mx-auto w-full max-w-7xl px-6 pt-14 text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-gray-900">
          {processHeading}
        </h1>
        <div className="mt-3 flex items-center justify-center gap-4 flex-wrap">
          <p className="text-lg font-medium text-gray-400">Applicants</p>
          {expiredCount > 0 && (
            <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
              <AlertTriangle className="w-4 h-4" />
              {expiredCount} expired
            </span>
          )}
          {blockedCount > 0 && (
            <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium">
              <Ban className="w-4 h-4" />
              {blockedCount} blocked
            </span>
          )}
        </div>
      </header>

      {/* ✅ Filter Tabs */}
      <div className="mx-auto w-full max-w-7xl px-6 mt-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filterStatus === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All ({applicants.length})
            </button>
            <button
              onClick={() => setFilterStatus("expired")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filterStatus === "expired"
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Expired ({expiredCount})
            </button>
            <button
              onClick={() => setFilterStatus("in-progress")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filterStatus === "in-progress"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              In Progress ({inProgressCount})
            </button>
            <button
              onClick={() => setFilterStatus("completed")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filterStatus === "completed"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Completed ({completedCount})
            </button>
            <button
              onClick={() => setFilterStatus("blocked")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filterStatus === "blocked"
                  ? "bg-orange-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Blocked ({blockedCount})
            </button>
          </div>

          {/* ✅ Refresh Button */}
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Table */}
      <main className="mx-auto mt-6 w-full max-w-7xl px-6 pb-20">
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr className="[&>th]:px-4 [&>th]:py-3">
                  <th className="w-[20%]">Name</th>
                  <th className="text-center w-[12%]">Status</th>
                  <th className="text-center w-[18%]">Progress</th>
                  <th className="text-center w-[18%]">Timeline</th>
                  <th className="text-right w-[32%] pr-2">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredApplicants.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-6 text-center text-slate-500"
                    >
                      No applicants found.
                    </td>
                  </tr>
                ) : (
                  filteredApplicants.map((a: any) => (
                    <tr
                      key={a.id}
                      className={`hover:bg-slate-50/60 transition-colors ${
                        a.hasExpiredTimeline ? "bg-red-50/40" : ""
                      } ${a.status === "blocked" ? "bg-orange-50/30" : ""}`}
                    >
                      {/* Name & Email */}
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-slate-900">
                          {a.name}
                        </p>
                        <p className="text-xs text-slate-500">{a.email}</p>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 text-center">
                        <StatusBadge status={a.status} />
                      </td>

                      {/* ✅ Round Progress */}
                      <td className="px-4 py-3">
                        <RoundProgress
                          progress={a.roundProgress}
                          currentRound={a.currentRound}
                        />
                      </td>

                      {/* ✅ Timeline Status */}
                      <td className="px-4 py-3">
                        <TimelineStatus
                          hasExpired={a.hasExpiredTimeline}
                          currentRound={a.currentRound}
                          timeRemaining={a.timeRemaining}
                        />
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* View Button */}
                          <button
                            className="cursor-pointer inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition hover:bg-purple-50"
                            style={{
                              borderColor: PURPLE,
                              color: PURPLE,
                            }}
                            onClick={() => {
                              router.push(
                                `/admin/processes/applications/applicant/${a.applicationId}`
                              );
                            }}
                          >
                            <Eye size={14} />
                            View
                          </button>

                          {/* ✅ Block Button - Only for expired and not already blocked */}
                          {a.hasExpiredTimeline && a.status !== "blocked" && (
                            <button
                              className="cursor-pointer inline-flex items-center gap-2 rounded-full bg-orange-500 hover:bg-orange-600 px-3 py-1.5 text-sm font-medium text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                              onClick={() =>
                                openBlockModal(a.id, a.name, a.applicationId)
                              }
                              disabled={blockingId === a.id}
                            >
                              {blockingId === a.id ? (
                                <>
                                  <RefreshCw className="h-4 w-4 animate-spin" />
                                  Blocking...
                                </>
                              ) : (
                                <>
                                  <Ban className="h-4 w-4" />
                                  Block
                                </>
                              )}
                            </button>
                          )}

                          {/* ✅ Unblock Button - Only for blocked users */}
                          {a.status === "blocked" && (
                            <button
                              className="cursor-pointer inline-flex items-center gap-2 rounded-full bg-green-500 hover:bg-green-600 px-3 py-1.5 text-sm font-medium text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                              onClick={() =>
                                handleUnblock(a.id, a.applicationId, a.name)
                              }
                              disabled={unblockingId === a.id}
                            >
                              {unblockingId === a.id ? (
                                <>
                                  <RefreshCw className="h-4 w-4 animate-spin" />
                                  Unblocking...
                                </>
                              ) : (
                                <>
                                  <Unlock className="h-4 w-4" />
                                  Unblock
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* ✅ Block Duration Modal */}
      <BlockDurationModal
        isOpen={showBlockModal}
        onClose={() => {
          setShowBlockModal(false);
          setSelectedApplicant(null);
        }}
        onConfirm={handleBlockConfirm}
        candidateName={selectedApplicant?.name || ""}
        loading={!!blockingId}
      />
    </div>
  );
}
