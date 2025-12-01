"use client";

import { useEffect, useState, ChangeEvent, useRef, memo } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Eye, EyeOff, UploadIcon } from "lucide-react";
import { useIsLocked } from "../../Context";
import { motion } from "framer-motion";

import { renderToReactElement } from "@tiptap/static-renderer/pm/react";
import { tiptapExtensions } from "@/components/tiptap/TiptapEditor";

// ✅ Field Renderer Component
const FieldRenderer = memo<{
  field: any;
  value: string | string[];
  isLocked: boolean;
  onChange: (fieldId: string, value: string | string[]) => void;
}>(({ field, value, isLocked, onChange }) => {
  const description =
    field.description?.content?.length > 0
      ? renderToReactElement({
          extensions: tiptapExtensions,
          content: field.description,
        })
      : null;

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    onChange(field._id, e.target.value);
  };

  const handleCheckboxChange = (option: string) => {
    if (!Array.isArray(value)) return;
    const updated = value.includes(option)
      ? value.filter((o: string) => o !== option)
      : [...value, option];
    onChange(field._id, updated);
  };

  const handleRadioChange = (option: string) => {
    onChange(field._id, option);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // ✅ File size limit: 10MB
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB in bytes

    if (file.size > MAX_SIZE) {
      alert("File too large! Maximum size is 10MB.");
      e.target.value = ""; // Reset input
      return;
    }

    // ✅ Allowed file types validation
    const allowedTypes = [
      "image/",
      "audio/",
      "video/",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/zip",
      "application/x-rar-compressed",
    ];

    const isValidType = allowedTypes.some(
      (type) => file.type.startsWith(type) || file.type === type
    );

    if (!isValidType) {
      alert("Invalid file type! Please upload a supported document.");
      e.target.value = "";
      return;
    }

    // ✅ Store filename temporarily (will be uploaded on submit)
    onChange(field._id, file.name);
  };

  return (
    <div
      id={field._id}
      className="p-4 border rounded-lg bg-gray-50 border-gray-300 space-y-2"
    >
      <div className="font-semibold text-lg text-gray-900">
        {field.question}
      </div>
      {description && (
        <div className="prose prose-indigo text-gray-700 max-w-none">
          {description}
        </div>
      )}

      {field.subType === "shortText" && (
        <input
          type="text"
          className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
          value={value as string}
          disabled={isLocked}
          onChange={handleInputChange}
          placeholder="Answer"
        />
      )}

      {field.subType === "longText" && (
        <textarea
          rows={4}
          className="w-full p-3 border border-gray-300 rounded resize-y focus:outline-none focus:ring-2 focus:ring-indigo-400"
          value={value as string}
          disabled={isLocked}
          onChange={handleInputChange}
          placeholder="Answer"
        />
      )}

      {field.subType === "singleChoice" && (
        <div className="flex flex-col gap-2">
          {field.options?.map((opt: string) => (
            <label
              key={opt}
              className="flex items-center space-x-2 cursor-pointer"
            >
              <input
                type="radio"
                className="text-indigo-600"
                checked={value === opt}
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
          {field.options?.map((opt: string) => (
            <label
              key={opt}
              className="flex items-center space-x-2 cursor-pointer"
            >
              <input
                type="checkbox"
                className="text-indigo-600"
                checked={Array.isArray(value) && value.includes(opt)}
                onChange={() => handleCheckboxChange(opt)}
                disabled={isLocked}
              />
              <span className="text-gray-900">{opt}</span>
            </label>
          ))}
        </div>
      )}

      {field.subType === "fileUpload" && (
        <div className="relative">
          <input
            type="file"
            accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.txt,.csv,.xls,.xlsx,.ppt,.pptx,.zip,.rar"
            id={`file-${field._id}`}
            className="hidden"
            disabled={isLocked}
            onChange={handleFileChange}
          />
          <label
            htmlFor={`file-${field._id}`}
            className={`
              flex items-center justify-center gap-2 w-full 
              px-4 py-3 rounded-lg border-2 border-dashed 
              text-sm font-medium transition-all cursor-pointer
              ${
                isLocked
                  ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                  : "border-indigo-300 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:border-indigo-400"
              }
            `}
          >
            <UploadIcon className="w-5 h-5" />
            {value ? "Change file" : "Choose file"}
          </label>
          {value && (
            <p className="mt-2 text-xs text-center text-gray-600 truncate">
              📎 {value}
            </p>
          )}
          <p className="mt-1 text-xs text-center text-gray-500">
            Max size: 10MB • PDF, DOCX, Images, Audio, Video
          </p>
        </div>
      )}
    </div>
  );
});

FieldRenderer.displayName = "FieldRenderer";

// ✅ Instructions Component
const InstructionRenderer = memo<{ instruction: any }>(({ instruction }) => {
  const instructionContent =
    instruction?.content?.length > 0
      ? renderToReactElement({
          extensions: tiptapExtensions,
          content: instruction,
        })
      : null;

  if (!instructionContent) return null;

  return (
    <div className="p-6 border rounded-lg bg-blue-50 border-blue-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Instructions</h3>
      <div className="prose prose-indigo max-w-none">{instructionContent}</div>
    </div>
  );
});

InstructionRenderer.displayName = "InstructionRenderer";

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
  const [showInstructions, setShowInstructions] = useState(true);

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
        console.error("❌ Fetch error:", error);
      } finally {
        setLoading(false);
      }
    }
    if (id && roundId) fetchData();
  }, [id, roundId]);

  const handleChange = async (fieldId: string, value: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [fieldId]: value }));

    // ✅ Skip autosave for file uploads (files are sent on submit)
    const field = round?.fields?.find((f: any) => f._id === fieldId);
    if (field?.subType === "fileUpload") return;

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
    if (saving) return;

    if ((round?.type === "form" || round?.type === "hybrid") && round?.fields) {
      const unanswered = round.fields.filter((f: any) => !isFieldAnswered(f));
      if (unanswered.length > 0) {
        alert(`${unanswered.length} fields remaining`);
        return;
      }
    }

    setSubmitting(true);
    try {
      // ✅ Check if there are file fields
      const hasFiles = round?.fields?.some(
        (f: any) => f.subType === "fileUpload"
      );

      if (hasFiles) {
        // ✅ Use FormData for file uploads
        const formData = new FormData();

        const answersPayload = Object.entries(answers).map(([fid, answer]) => ({
          fieldId: fid,
          answer: answer,
        }));

        formData.append("answers", JSON.stringify(answersPayload));

        // ✅ Add files to FormData
        for (const field of round.fields) {
          if (field.subType === "fileUpload") {
            const fileInput = document.getElementById(
              `file-${field._id}`
            ) as HTMLInputElement;
            const file = fileInput?.files?.[0];
            if (file) {
              formData.append(`file_${field._id}`, file);
            }
          }
        }

        const res = await fetch(
          `/api/candidate/applications/${id}/round/${roundId}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: formData, // ✅ Send FormData
          }
        );

        if (!res.ok) throw new Error("Submission failed");
      } else {
        // ✅ JSON for text-only submissions
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
      }

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
          >
            <h1 className="mb-6 text-4xl font-bold text-white drop-shadow-md">
              {round.title}
            </h1>
          </motion.main>
        </header>

        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto bg-white rounded-xl shadow-lg border border-gray-200 p-6 space-y-6"
          style={{ minHeight: 0 }}
        >
          {round.type === "instruction" && (
            <InstructionRenderer instruction={round.instruction} />
          )}

          {round.type === "form" &&
            round.fields?.map((field: any) => {
              const val =
                answers[field._id] ||
                (field.subType === "multipleChoice" ? [] : "");
              return (
                <FieldRenderer
                  key={field._id}
                  field={field}
                  value={val}
                  isLocked={isLocked}
                  onChange={handleChange}
                />
              );
            })}

          {round.type === "hybrid" && (
            <div className="space-y-6">
              {round.instruction?.content?.length > 0 && (
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowInstructions(!showInstructions)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    {showInstructions ? (
                      <>
                        <EyeOff className="w-4 h-4" /> Hide Instructions
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4" /> Show Instructions
                      </>
                    )}
                  </button>
                </div>
              )}

              {showInstructions && (
                <InstructionRenderer instruction={round.instruction} />
              )}

              {round.fields?.map((field: any) => {
                const val =
                  answers[field._id] ||
                  (field.subType === "multipleChoice" ? [] : "");
                return (
                  <FieldRenderer
                    key={field._id}
                    field={field}
                    value={val}
                    isLocked={isLocked}
                    onChange={handleChange}
                  />
                );
              })}
            </div>
          )}

          {!round.fields?.length && round.type !== "instruction" && (
            <div className="text-center text-gray-500 py-8">
              <p>No content available for this round.</p>
            </div>
          )}
        </div>

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
            className="flex cursor-pointer items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md hover:scale-105 transition disabled:opacity-50"
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
