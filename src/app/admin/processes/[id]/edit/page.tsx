"use client";

import { useState, useMemo, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import { Open_Sans } from "next/font/google";

const openSans = Open_Sans({ subsets: ["latin"] });

export default function EditProcessPage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params?.id ?? "");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // ✅ Load existing data
  useEffect(() => {
    async function fetchProcess() {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`/api/admin/process/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setTitle(res.data.title || "");
        setDescription(res.data.description || "");
      } catch (err: any) {
        setErrorMsg(err?.response?.data?.error || "Failed to load process");
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchProcess();
  }, [id]);

  const titleError = useMemo(() => {
    if (!title.trim()) return "Title is required";
    if (title.trim().length < 3) return "Title must be at least 3 characters";
    return null;
  }, [title]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    if (titleError) return;

    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      if (!token) {
        setErrorMsg("You are not logged in.");
        return;
      }

      await axios.patch(
        `/api/admin/process/${id}`,
        { title: title.trim(), description: description.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Redirect to process details
      router.push(`/admin/processes/${id}`);
    } catch (err: any) {
      console.error("Failed to update process:", err);
      const message =
        err?.response?.data?.error ||
        err?.message ||
        "Failed to update process";
      setErrorMsg(message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className={`${openSans.className} mx-auto max-w-2xl p-4 md:p-8`}>
        <div className="h-8 w-64 animate-pulse rounded bg-slate-200" />
        <div className="mt-8 space-y-4">
          <div className="h-12 w-full animate-pulse rounded-lg bg-slate-200" />
          <div className="h-32 w-full animate-pulse rounded-lg bg-slate-200" />
        </div>
      </div>
    );
  }

  return (
    <div className={`${openSans.className} mx-auto max-w-2xl p-4 md:p-8`}>
      <div className="mb-6">
        <Link
          href={`/admin/processes/${id}`}
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
        >
          ← Back to Process
        </Link>
      </div>

      <h1 className="text-2xl font-semibold text-slate-900">Edit Process</h1>
      <p className="mt-1 text-sm text-slate-600">
        Update the process title and description.
      </p>

      {/* Error banner */}
      {errorMsg && (
        <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {errorMsg}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <fieldset disabled={saving} className="space-y-5">
          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-slate-800"
            >
              Title <span className="text-rose-600">*</span>
            </label>
            <input
              id="title"
              type="text"
              placeholder="e.g. Software Engineer Hiring"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 ${
                titleError
                  ? "border-rose-300 focus:ring-rose-400"
                  : "border-slate-200 focus:ring-blue-500"
              }`}
              maxLength={120}
              autoFocus
            />
            <div className="mt-1 flex items-center justify-between text-xs">
              <span
                className={`${titleError ? "text-rose-600" : "text-slate-500"}`}
              >
                {titleError ? titleError : "Use a short, descriptive title."}
              </span>
              <span className="text-slate-400">{title.trim().length}/120</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-slate-800"
            >
              Description{" "}
              <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <textarea
              id="description"
              placeholder="Brief description of the recruitment process"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={1000}
            />
            <div className="mt-1 text-right text-xs text-slate-400">
              {description.trim().length}/1000
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <Link
              href={`/admin/processes/${id}`}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving || !!titleError}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saving ? (
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
                  Saving…
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </fieldset>
      </form>
    </div>
  );
}
