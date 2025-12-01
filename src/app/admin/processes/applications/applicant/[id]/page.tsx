"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Open_Sans } from "next/font/google";
import axios from "axios";
import { renderToReactElement } from "@tiptap/static-renderer/pm/react";
import { tiptapExtensions } from "@/components/tiptap/TiptapEditor"; // ✅ Import your extensions

const openSans = Open_Sans({ subsets: ["latin"] });

interface Field {
  questionText: string;
  description?: any; // ✅ TipTap JSON object
  answer: string;
  fieldType: string;
}

interface Round {
  roundId: string;
  roundName: string;
  roundStatus: string;
  fields: Field[];
}

export default function RoundSummaryPage() {
  const { id } = useParams<{ id: string }>();
  const [roundData, setRoundData] = useState<Round[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRoundData() {
      try {
        const res = await axios({
          url: `/api/admin/process/applications/application/${id}`,
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (res.status != 200) throw new Error("Failed to fetch round data");
        setRoundData(res.data);
        console.log(res.data);
      } catch (err: any) {
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchRoundData();
  }, [id]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;
  if (!roundData) return <div className="p-6">Round not found.</div>;

  return (
    <div className={`${openSans.className} p-6 max-w-4xl mx-auto`}>
      {roundData.map((round) => {
        return (
          <div key={round.roundId}>
            <h1 className="mt-5 text-2xl font-semibold text-slate-900">
              {round.roundName}
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Status: {round.roundStatus}
            </p>

            <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
              {round.fields.map((field, idx) => {
                // ✅ Render TipTap description
                const descriptionContent =
                  field.description?.content?.length > 0
                    ? renderToReactElement({
                        extensions: tiptapExtensions,
                        content: field.description,
                      })
                    : null;

                return (
                  <div
                    key={idx}
                    className="pb-4 border-b border-slate-100 last:border-b-0 last:pb-0"
                  >
                    {/* ✅ Question */}
                    <p className="font-semibold text-slate-900 text-base">
                      {field.questionText}
                    </p>

                    {/* ✅ TipTap Description */}
                    {descriptionContent && (
                      <div className="mt-2 prose prose-sm prose-slate max-w-none text-slate-600">
                        {descriptionContent}
                      </div>
                    )}

                    {/* ✅ Answer */}
                    <div className="mt-3 text-slate-700 break-words overflow-wrap-anywhere">
                      {field.answer ? (
                        field.fieldType === "fileUpload" ? (
                          <button
                            className="cursor-pointer p-[7px] my-1 rounded-md px-4 text-white bg-blue-600 hover:bg-blue-700 transition"
                            onClick={() => window.open(field.answer, "_blank")}
                          >
                            View Uploaded
                          </button>
                        ) : (
                          <div className="whitespace-pre-wrap break-all bg-slate-50 rounded-lg p-3 border border-slate-200">
                            {field.answer}
                          </div>
                        )
                      ) : (
                        <span className="text-slate-400 italic">N/A</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
