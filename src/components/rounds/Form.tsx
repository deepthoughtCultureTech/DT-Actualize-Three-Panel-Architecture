import { motion } from "framer-motion";
import { memo, useCallback, useState, useEffect } from "react";

interface Field {
  _id: string;
  question: string;
  subType:
    | "shortText"
    | "longText"
    | "fileUpload"
    | "singleChoice"
    | "multipleChoice";
  options?: string[];
}

interface FormRoundProps {
  fields?: Field[];
  answers: Record<string, string | string[]>;
  isLocked: boolean;
  onChange: (fieldId: string, value: string | string[]) => void;
  saving?: boolean;
  setSaving?: (saving: boolean) => void;
}

// ✅ Typed props for FieldInput
interface FieldInputProps {
  field: Field;
  value: string | string[];
  isLocked: boolean;
  onChange: (fieldId: string, value: string | string[]) => void;
  onFileUpload: (fieldId: string, file: File) => void;
}

export default function Form({
  fields = [],
  answers,
  isLocked,
  onChange,
  setSaving,
}: FormRoundProps) {
  const handleFileUpload = useCallback(
    async (fieldId: string, file: File) => {
      setSaving?.(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", "file");

        const token = localStorage.getItem("token");
        const res = await fetch("/api/admin/upload", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        if (!res.ok) throw new Error("Upload failed");
        const data = await res.json();
        onChange(fieldId, data.url);
      } catch (err) {
        console.error(err);
      } finally {
        setSaving?.(false);
      }
    },
    [onChange, setSaving]
  );

  return (
    <motion.div className="w-full h-full bg-white rounded-2xl shadow-lg p-8 flex flex-col">
      <form className="space-y-6">
        <div className="space-y-6 h-[560px] overflow-y-auto">
          {fields.map((field) => (
            <FieldInput
              key={field._id}
              field={field}
              value={answers[field._id] || ""}
              isLocked={isLocked}
              onChange={onChange}
              onFileUpload={handleFileUpload}
            />
          ))}
        </div>
      </form>
    </motion.div>
  );
}

const FieldInput = memo<FieldInputProps>(
  ({ field, value: parentValue, isLocked, onChange, onFileUpload }) => {
    const [value, setValue] = useState<string | string[]>(parentValue);

    useEffect(() => {
      setValue(parentValue);
    }, [parentValue]);

    const handleInputChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
      setValue(e.target.value);
      onChange(field._id, e.target.value);
    };

    const commonClasses = `
      w-full border rounded-lg p-3 
      focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
      ${isLocked ? "cursor-not-allowed bg-gray-50" : "cursor-text"}
    `;

    return (
      <motion.div className="space-y-2" id={field._id}>
        <label
          htmlFor={field._id}
          className="text-sm font-medium text-gray-800"
        >
          {field.question} <span className="text-red-500 ml-1">*</span>
        </label>

        {/* ✅ Short Text */}
        {field.subType === "shortText" && (
          <input
            type="text"
            id={field._id}
            value={(value as string) || ""}
            disabled={isLocked}
            onChange={handleInputChange}
            className={commonClasses}
            placeholder="Enter your answer..."
            maxLength={500}
            required
          />
        )}

        {/* ✅ Long Text */}
        {field.subType === "longText" && (
          <textarea
            id={field._id}
            value={(value as string) || ""}
            disabled={isLocked}
            onChange={handleInputChange}
            className={commonClasses}
            placeholder="Enter your detailed answer..."
            rows={6}
            maxLength={5000}
            required
          />
        )}

        {/* ✅ File Upload */}
        {field.subType === "fileUpload" && (
          <>
            {parentValue ? (
              <div
                className={`flex items-center justify-between border p-3 rounded-lg ${
                  isLocked ? "cursor-not-allowed bg-gray-50" : ""
                }`}
              >
                <a
                  href={parentValue as string}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline text-sm"
                >
                  View Uploaded File
                </a>
                {!isLocked && (
                  <button
                    type="button"
                    onClick={() => onChange(field._id, "")}
                    className="text-red-600 hover:underline text-sm"
                  >
                    Delete
                  </button>
                )}
              </div>
            ) : (
              <input
                type="file"
                id={field._id}
                disabled={isLocked}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const file = e.target.files?.[0];
                  if (file) onFileUpload(field._id, file);
                }}
                className={`${commonClasses} ${
                  isLocked ? "cursor-not-allowed bg-gray-100" : "cursor-pointer"
                }`}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
            )}
          </>
        )}

        {/* ✅ Single Choice (Radio Buttons) */}
        {field.subType === "singleChoice" && field.options && (
          <div className="space-y-2">
            {field.options.map((option: string, index: number) => (
              <label
                key={index}
                className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition"
              >
                <input
                  type="radio"
                  name={field._id}
                  value={option}
                  checked={(parentValue as string) === option}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    onChange(field._id, e.target.value)
                  }
                  disabled={isLocked}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed"
                />
                <span className="text-sm text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        )}

        {/* ✅ Multiple Choice (Checkboxes) */}
        {field.subType === "multipleChoice" && field.options && (
          <div className="space-y-2">
            {field.options.map((option: string, index: number) => {
              const selectedOptions = (parentValue as string[]) || [];
              const isChecked = selectedOptions.includes(option);

              return (
                <label
                  key={index}
                  className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition"
                >
                  <input
                    type="checkbox"
                    value={option}
                    checked={isChecked}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const currentSelections = (parentValue as string[]) || [];
                      const newSelections = e.target.checked
                        ? [...currentSelections, option]
                        : currentSelections.filter((o) => o !== option);
                      onChange(field._id, newSelections);
                    }}
                    disabled={isLocked}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 disabled:cursor-not-allowed"
                  />
                  <span className="text-sm text-gray-700">{option}</span>
                </label>
              );
            })}
          </div>
        )}
      </motion.div>
    );
  }
);

FieldInput.displayName = "FieldInput";
