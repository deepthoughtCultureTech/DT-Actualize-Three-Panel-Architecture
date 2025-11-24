"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, EyeOff, Eye } from "lucide-react";
import { useIsLocked } from "../../Context";
import Form from "@/components/rounds/Form";
import Instructions from "@/components/rounds/Instructions";

interface Field {
  _id: string;
  question: string;
  subType:
    | "shortText"
    | "longText"
    | "fileUpload"
    | "singleChoice"
    | "multipleChoice";
  options: string[]; // ✅ For choice-based fields
}

interface Upload {
  url: string;
  type: "image" | "audio";
}

interface Round {
  _id: string;
  order: number;
  title: string;
  type: "form" | "instruction" | "hybrid";
  fields?: Field[];
  instruction?: string;
  uploads?: Upload[];
}

export default function RoundSubmissionPage() {
  const { id, roundId } = useParams<{ id: string; roundId: string }>();
  const router = useRouter();
  const isLocked = useIsLocked();

  const [rounds, setRounds] = useState<Round[]>([]);
  const [round, setRound] = useState<Round | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [saving, setSaving] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);

  // ✅ Fetch process + application answers
  useEffect(() => {
    const fetchProcessAndAnswers = async () => {
      try {
        const token = localStorage.getItem("token");

        // fetch process
        const res = await fetch(`/api/candidate/processes/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch process");
        const process = await res.json();

        const sortedRounds = [...process.rounds].sort(
          (a: Round, b: Round) => Number(a.order) - Number(b.order)
        );
        setRounds(sortedRounds);

        const selected = sortedRounds.find((r) => r._id === roundId);
        setRound(selected || null);

        // fetch application answers
        const appRes = await fetch(`/api/candidate/applications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (appRes.ok) {
          const apps = await appRes.json();
          const app = apps.find((a: any) => a.process._id === id);
          if (app) {
            const roundProgress = app.rounds.find(
              (r: any) => r.roundId === roundId
            );
            if (roundProgress && roundProgress.answers) {
              const prefilled: Record<string, string | string[]> = {};
              roundProgress.answers.forEach((ans: any) => {
                prefilled[ans.fieldId] = ans.answer;
              });
              setAnswers(prefilled);
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id && roundId) fetchProcessAndAnswers();
  }, [id, roundId]);

  // ✅ Autosave handler
  const handleChange = async (fieldId: string, value: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [fieldId]: value }));

    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      await fetch(`/api/candidate/applications/${id}/round/${roundId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          answers: [{ fieldId, answer: value }],
        }),
      });
    } catch (err) {
      console.error("Autosave failed:", err);
    } finally {
      setSaving(false);
    }
  };

  // ✅ Validation helper
  const isFieldAnswered = (field: Field): boolean => {
    const answer = answers[field._id];

    if (!answer) return false;

    // For arrays (multipleChoice)
    if (Array.isArray(answer)) {
      return answer.length > 0;
    }

    // For strings
    return answer.trim() !== "";
  };

  // ✅ Full round submit
  const handleSubmit = async () => {
    if ((round?.type === "form" || round?.type === "hybrid") && round.fields) {
      const unansweredFields = round.fields.filter(
        (field) => !isFieldAnswered(field)
      );

      if (unansweredFields.length > 0) {
        // Scroll to first unanswered field and highlight
        const firstFieldId = unansweredFields[0]._id;
        const el = document.getElementById(firstFieldId);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });

        // Flash red border
        unansweredFields.forEach((field) => {
          const elem = document.getElementById(field._id);
          if (elem) {
            elem.classList.add("border-red-500");
            setTimeout(() => elem.classList.remove("border-red-500"), 2000);
          }
        });

        // Show alert
        alert(
          `Please answer all required fields. ${unansweredFields.length} field(s) remaining.`
        );
        return;
      }
    }

    // ✅ Proceed with saving & submitting
    setSubmitting(true);
    try {
      const payload =
        round?.type === "form" || round?.type === "hybrid"
          ? {
              answers: Object.entries(answers).map(([fieldId, answer]) => ({
                fieldId,
                answer,
              })),
            }
          : {};

      const res = await fetch(
        `/api/candidate/applications/${id}/round/${roundId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Submission failed");

      const currentIndex = rounds.findIndex((r) => r._id === roundId);
      if (currentIndex !== -1 && currentIndex < rounds.length - 1) {
        const nextRoundId = rounds[currentIndex + 1]._id;
        router.push(`/candidate/processes/${id}/round/${nextRoundId}`);
      } else {
        router.push(`/candidate/processes/${id}/whatsapp-group`);
      }
    } catch (err) {
      console.error(err);
      alert("Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ Back button handler
  const handleBack = () => {
    if (currentRoundIndex === 1) {
      router.push("/candidate/dashboard");
    } else {
      const prevRoundId = rounds[currentRoundIndex - 2]?._id;
      if (prevRoundId) {
        router.push(`/candidate/processes/${id}/round/${prevRoundId}`);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center min-h-screen bg-gradient-to-b from-sky-500 to-blue-900">
        <p className="text-white">Loading round...</p>
      </div>
    );
  }

  if (!round) {
    return (
      <div className="flex h-screen items-center justify-center min-h-screen bg-gradient-to-b from-sky-500 to-blue-900">
        <p className="text-white">Round not found</p>
      </div>
    );
  }

  const currentRoundIndex = rounds.findIndex((r) => r._id === roundId) + 1;

  return (
    <div className="h-[calc(100vh-64px)] bg-gradient-to-b from-sky-500 to-blue-900 text-gray-800">
      <div className="container mx-auto py-6 flex flex-col h-full">
        {/* ✅ Header */}
        <header className="text-center mt-6">
          <motion.main
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex-1 flex items-center justify-center"
          >
            <h1 className="mb-1 text-4xl font-bold text-white drop-shadow-md">
              {round.title}
            </h1>
          </motion.main>
        </header>

        {/* ✅ Main Body */}
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex-1 flex flex-col md:flex-row gap-6 items-start justify-center"
        >
          {round.type === "instruction" && (
            <Instructions
              instruction={round.instruction}
              uploads={round.uploads}
            />
          )}

          {round.type === "form" && (
            <Form
              fields={round.fields}
              answers={answers}
              isLocked={isLocked}
              onChange={handleChange}
            />
          )}

          {round.type === "hybrid" && (
            <div className="w-full">
              {/* Toggle */}
              <div className="flex justify-end mb-2">
                <button
                  onClick={() => setShowInstructions((prev) => !prev)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 transition shadow-md"
                >
                  {showInstructions ? (
                    <>
                      <EyeOff className="w-4 h-4" /> Hide Guidelines
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4" /> View Guidelines
                    </>
                  )}
                </button>
              </div>

              {/* Layout */}
              <div className="flex flex-col md:flex-row w-full gap-6">
                <div className="w-full">
                  <Form
                    fields={round.fields}
                    answers={answers}
                    isLocked={isLocked}
                    onChange={handleChange}
                  />
                </div>

                {showInstructions && (
                  <div className="w-3/6">
                    <Instructions
                      instruction={round.instruction}
                      uploads={round.uploads}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.main>

        {/* Navigation Buttons */}
        <div className="flex justify-center gap-5 m-6 ml-10">
          {currentRoundIndex !== 1 && (
            <button
              type="button"
              onClick={handleBack}
              disabled={submitting}
              className="flex cursor-pointer items-center gap-2 px-6 py-3 rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-100 transition disabled:opacity-50"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous Round
            </button>
          )}

          {currentRoundIndex == rounds.length && (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving || submitting}
              className="flex cursor-pointer items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md hover:scale-105 transition disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : submitting
                ? "Submitting..."
                : "Submit & Group Link"}
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {currentRoundIndex < rounds.length && (
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={saving || submitting}
              className="flex cursor-pointer items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-green-600 to-green-700 text-white shadow-md hover:scale-105 transition disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : submitting
                ? "Submitting..."
                : "Submit & Continue"}
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
