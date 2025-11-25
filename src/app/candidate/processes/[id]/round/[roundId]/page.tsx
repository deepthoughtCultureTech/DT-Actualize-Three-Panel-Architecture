"use client";

import { useEffect, useState, ChangeEvent, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useIsLocked } from "../../Context";
import { motion } from "framer-motion";

import StarterKit from "@tiptap/starter-kit";
import { renderToReactElement } from "@tiptap/static-renderer/pm/react";

export default function RoundSubmissionPage() {
  const { id, roundId } = useParams<{ id: string; roundId: string }>();
  const router = useRouter();
  const isLocked = useIsLocked();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [rounds, setRounds] = useState([] as any[]);
  const [round, setRound] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`/api/candidate/processes/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch process");
        const process = await res.json();
        const sortedRounds = [...process.rounds].sort(
          (a, b) => a.order - b.order
        );
        setRounds(sortedRounds);
        const selected = sortedRounds.find((r) => r._id === roundId);
        setRound(selected || null);
        const appRes = await fetch(`/api/candidate/applications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (appRes.ok) {
          const apps = await appRes.json();
          const app = apps.find((a: any) => a.process._id === id);
          if (app) {
            const roundData = app.rounds.find(
              (r: any) => r.roundId === roundId
            );
            if (roundData?.answers) {
              const resAnswers: any = {};
              roundData.answers.forEach((a: any) => {
                resAnswers[a.fieldId] = a.answer;
              });
              setAnswers(resAnswers);
            }
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    if (id && roundId) fetchData();
  }, [id, roundId]);

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
        body: JSON.stringify({ answers: [{ fieldId, answer: value }] }),
      });
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const isFieldAnswered = (field: any) => {
    const val = answers[field._id];
    if (!val) return false;
    if (Array.isArray(val)) return val.length > 0;
    return val.trim() !== "";
  };

  const handleSubmit = async () => {
    if (saving) {
      // Do not submit if saving is in progress
      return;
    }
    if (round?.fields) {
      const unanswered = round.fields.filter((f: any) => !isFieldAnswered(f));
      if (unanswered.length > 0) {
        const firstId = unanswered[0]._id;
        const el = document.getElementById(firstId);
        if (el && scrollRef.current) {
          const rect = el.getBoundingClientRect();
          scrollRef.current.scrollTo({
            top: rect.top + scrollRef.current.scrollTop - 20,
            behavior: "smooth",
          });
        }
        unanswered.forEach((f: any) => {
          const e = document.getElementById(f._id);
          if (e) {
            e.classList.add("border-red-500");
            setTimeout(() => e.classList.remove("border-red-500"), 2000);
          }
        });
        alert(`${unanswered.length} fields remaining`);
        return;
      }
    }
    setSubmitting(true);
    try {
      const payload = {
        answers: Object.entries(answers).map(([fid, answer]) => ({
          fieldId: fid,
          answer,
        })),
      };
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
    } catch (error) {
      console.error(error);
      alert("Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    const idx = rounds.findIndex((r) => r._id === roundId);
    if (idx === 0) router.push("/candidate/dashboard");
    else router.push(`/candidate/processes/${id}/round/${rounds[idx - 1]._id}`);
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-b from-sky-500 to-blue-900">
        <p className="text-white">Loading...</p>
      </div>
    );
  if (!round)
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-b from-sky-500 to-blue-900">
        <p className="text-white">No round found</p>
      </div>
    );

  const currentIdx = rounds.findIndex((r) => r._id === roundId) + 1;

  return (
    <div className="h-[calc(100vh-64px)] w-[calc(100vw-240px)] bg-gradient-to-b from-sky-500 to-blue-900 px-6 text-gray-800">
      <div className="container mx-auto flex flex-col h-full py-6">
        <header className="text-center">
          <motion.main
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex-1 flex items-center justify-center"
          >
            <h1 className="mb-6 text-4xl font-bold text-white drop-shadow-md">
              {round.title}
            </h1>
          </motion.main>
        </header>

        {/* Single scrollable container */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto bg-white rounded-xl shadow-lg border border-gray-200 p-6 space-y-6"
          style={{ minHeight: 0 }}
        >
          {round.type === "form" &&
            round.fields?.map((field: any) => {
              const description = field.description
                ? renderToReactElement({
                    extensions: [StarterKit],
                    content: field.description,
                  })
                : null;
              const val =
                answers[field._id] ||
                (field.subType === "multipleChoice" ? [] : "");

              const handleInputChange = (
                e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
              ) => {
                handleChange(field._id, e.target.value);
              };

              const handleCheckboxChange = (option: string) => {
                if (!Array.isArray(val)) return;
                const updated = val.includes(option)
                  ? val.filter((o: string) => o !== option)
                  : [...val, option];
                handleChange(field._id, updated);
              };

              const handleRadioChange = (option: string) => {
                handleChange(field._id, option);
              };

              const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
                const file = e.target.files?.[0];
                if (file) handleChange(field._id, file.name);
              };

              return (
                <div
                  key={field._id}
                  id={field._id}
                  className="p-4 border rounded-lg bg-gray-50 border-gray-300 space-y-2"
                >
                  <div className="font-semibold text-lg text-gray-900">
                    {field.question}
                  </div>
                  {description && (
                    <div className="prose prose-indigo text-gray-700">
                      {description}
                    </div>
                  )}

                  {field.subType === "shortText" && (
                    <input
                      type="text"
                      className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      value={val}
                      disabled={isLocked}
                      onChange={handleInputChange}
                      placeholder="Answer"
                    />
                  )}
                  {field.subType === "longText" && (
                    <textarea
                      rows={4}
                      className="w-full p-3 border border-gray-300 rounded resize-y focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      value={val}
                      disabled={isLocked}
                      onChange={handleInputChange}
                      placeholder="Answer"
                    />
                  )}
                  {field.subType === "singleChoice" && (
                    <div className="flex flex-col gap-2">
                      {field.options.map((opt: string) => (
                        <label
                          key={opt}
                          className="flex items-center space-x-2 cursor-pointer"
                        >
                          <input
                            type="radio"
                            className="text-indigo-600"
                            checked={val === opt}
                            onChange={() => handleRadioChange(opt)}
                            disabled={isLocked}
                          />
                          <span className="text-gray-900">{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}
                  {field.subType === "multipleChoice" && (
                    <div className="flex flex-col gap-2">
                      {field.options.map((opt: string) => (
                        <label
                          key={opt}
                          className="flex items-center space-x-2 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            className="text-indigo-600"
                            checked={Array.isArray(val) && val.includes(opt)}
                            onChange={() => handleCheckboxChange(opt)}
                            disabled={isLocked}
                          />
                          <span className="text-gray-900">{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}
                  {field.subType === "fileUpload" && (
                    <input
                      type="file"
                      accept="image/*,audio/*"
                      className="cursor-pointer"
                      disabled={isLocked}
                      onChange={handleFileChange}
                    />
                  )}
                </div>
              );
            })}
        </div>

        {/* Navigation Buttons - centered within white container */}
        <div className="mt-6 flex justify-center gap-4">
          {currentIdx !== 1 && (
            <button
              onClick={handleBack}
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-3 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 transition disabled:opacity-50"
            >
              <ArrowLeft className="w-4 h-4" /> Previous Round
            </button>
          )}
          <button
            onClick={handleSubmit}
            disabled={saving || submitting}
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md hover:scale-105 transition disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : submitting
              ? "Submitting..."
              : currentIdx === rounds.length
              ? "Submit & Group Link"
              : "Submit & Continue"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
