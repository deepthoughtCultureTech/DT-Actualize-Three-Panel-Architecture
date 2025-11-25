// src/app/admin/processes/[id]/rounds/[roundId]/field/create/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Open_Sans } from "next/font/google";
import TiptapEditor from "@/components/tiptap/TiptapEditor";

const openSans = Open_Sans({ subsets: ["latin"] });

type SubType =
  | "shortText"
  | "longText"
  | "fileUpload"
  | "singleChoice"
  | "multipleChoice";

export default function CreateFieldPage() {
  const params = useParams<{ id: string; roundId: string }>();
  const processId = useMemo(() => String(params?.id ?? ""), [params]);
  const roundId = useMemo(() => String(params?.roundId ?? ""), [params]);
  const router = useRouter();

  const [token, setToken] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<SubType>("shortText");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [options, setOptions] = useState<string[]>(["", ""]);

  useEffect(() => {
    setToken(localStorage.getItem("token"));
  }, []);

  const questionError = !question.trim()
    ? "Question is required"
    : question.trim().length < 5
    ? "Field Title must be at least 5 characters"
    : null;

  const optionsError =
    type === "multipleChoice" || type === "singleChoice"
      ? options.filter((opt) => opt.trim()).length < 2
        ? "At least 2 options are required"
        : null
      : null;

  const addOption = () => {
    setOptions([...options, ""]);
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    if (questionError) return;
    if (optionsError) return;
    if (!token) {
      setErrorMsg("You are not logged in.");
      return;
    }

    try {
      setLoading(true);

      const payload: any = {
        question: question.trim(),
        subType: type,
      };

      // ✅ Add description if it has content
      if (description) {
        if (typeof description === "string") {
          const stripped = description.replace(/<[^>]*>/g, "").trim();
          if (stripped.length > 0 && description !== "<p></p>") {
            payload.description = description;
          }
        } else if (typeof description === "object") {
          // Store Tiptap JSON as-is
          payload.description = description;
        }
      }

      // ✅ Add options for choice fields
      if (type === "multipleChoice" || type === "singleChoice") {
        payload.options = options.filter((opt) => opt.trim());
      }

      const res = await fetch(
        `/api/admin/process/${processId}/round/${roundId}/field`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to create field");
      }

      router.push(`/admin/processes/${processId}/rounds/${roundId}`);
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to create field");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`${openSans.className} mx-auto max-w-4xl p-4 md:p-8`}>
      <div className="mb-4">
        <h1 className="text-2xl font-semibold text-slate-900">Create Field</h1>
        <p className="mt-1 text-sm text-slate-600">
          Define the fields and choose the response type.
        </p>
      </div>

      {errorMsg && (
        <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <fieldset disabled={loading} className="space-y-6">
          {/* Question */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <label
              htmlFor="question"
              className="block text-sm font-medium text-slate-800 mb-2"
            >
              Field Title <span className="text-rose-600">*</span>
            </label>
            <input
              id="question"
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. Why do you want to join us?"
              className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 ${
                questionError
                  ? "border-rose-300 focus:ring-rose-400"
                  : "border-slate-200 focus:ring-blue-500"
              }`}
              maxLength={240}
              autoFocus
            />
            <div className="mt-2 flex items-center justify-between text-xs">
              <span
                className={`${
                  questionError ? "text-rose-600" : "text-slate-500"
                }`}
              >
                {questionError ? questionError : "Keep it clear and concise."}
              </span>
              <span className="text-slate-400">
                {question.trim().length}/240
              </span>
            </div>
          </div>

          {/* Description (Optional - Rich Text Editor) */}
          <div>
            <label className="block text-sm font-medium text-slate-800 mb-2">
              Description{" "}
              <span className="text-slate-400 text-xs font-normal">
                (Optional)
              </span>
            </label>
            <p className="text-xs text-slate-600 mb-3">
              Provide additional context or instructions for this field.
            </p>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <TiptapEditor
                editable={true}
                content={description}
                onContentUpdate={setDescription}
              />
            </div>
          </div>

          {/* Type */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <label
              htmlFor="type"
              className="block text-sm font-medium text-slate-800 mb-2"
            >
              Response Type
            </label>
            <select
              id="type"
              value={type}
              onChange={(e) => {
                setType(e.target.value as SubType);
                if (
                  e.target.value === "multipleChoice" ||
                  e.target.value === "singleChoice"
                ) {
                  setOptions(["", ""]);
                }
              }}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="shortText">Short Text</option>
              <option value="longText">Long Text</option>
              <option value="fileUpload">File Upload</option>
              <option value="singleChoice">Single Choice</option>
              <option value="multipleChoice">Multiple Choice</option>
            </select>
            <p className="mt-2 text-xs text-slate-500">
              {type === "shortText" && "Single line text input (max 500 chars)"}
              {type === "longText" && "Multi-line text area (max 5000 chars)"}
              {type === "fileUpload" && "Allow candidates to upload files"}
              {type === "singleChoice" && "Radio buttons - select one option"}
              {type === "multipleChoice" &&
                "Checkboxes - select multiple options"}
            </p>
          </div>

          {/* Options for Multiple/Single Choice */}
          {(type === "multipleChoice" || type === "singleChoice") && (
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <label className="block text-sm font-medium text-slate-800 mb-3">
                Options <span className="text-rose-600">*</span>
              </label>
              <div className="space-y-2">
                {options.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                      maxLength={100}
                    />
                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="text-rose-600 hover:text-rose-700 text-sm font-medium px-2"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addOption}
                className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                + Add Option
              </button>
              {optionsError && (
                <p className="mt-2 text-xs text-rose-600">{optionsError}</p>
              )}
            </div>
          )}

          {/* Additional Config for Long Text */}
          {type === "longText" && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-700">
                <strong>Note:</strong> Long text fields will be displayed as a
                textarea with a minimum height of 4 rows.
              </p>
            </div>
          )}

          {/* Additional Config for File Upload */}
          {type === "fileUpload" && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <p className="text-xs text-purple-700">
                <strong>Note:</strong> Accepted file types: PDF, DOC, DOCX, JPG,
                PNG (Max 10MB)
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              type="button"
              onClick={() =>
                router.push(`/admin/processes/${processId}/rounds/${roundId}`)
              }
              className="cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !!questionError || !!optionsError}
              className="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? (
                <>
                  <svg
                    className="h-4 w-4 animate-spin"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      opacity="0.25"
                    />
                    <path
                      fill="currentColor"
                      d="M4 12a8 8 0 0 1 8-8v4A4 4 0 0 0 8 12H4z"
                    />
                  </svg>
                  Creating…
                </>
              ) : (
                "Create Field"
              )}
            </button>
          </div>
        </fieldset>
      </form>
    </div>
  );
}
