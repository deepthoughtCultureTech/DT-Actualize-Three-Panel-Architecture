"use client";

import "./styles.scss";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Audio from "./extensions/audio.js";
import { TableKit } from "@tiptap/extension-table";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import MenuBar from "./MenuBar";

interface TiptapEditorProps {
  editable: boolean;
  content: any;
  onContentUpdate?: (content: any) => void;
}

// ✅ Export ALL extensions (even if not in MenuBar yet)
export const tiptapExtensions = [
  StarterKit.configure({
    bulletList: {
      HTMLAttributes: {
        class: "list-disc ml-3 black",
      },
    },
  }),
  TableKit.configure({
    table: { resizable: true },
  }),
  Underline,
  TextAlign.configure({
    types: ["heading", "paragraph"],
  }),
  Link.configure({
    openOnClick: true,
  }),
  Image,
  Audio,
  TextStyle,
  Color,
  Highlight.configure({
    multicolor: true,
  }),
  TaskList,
  TaskItem.configure({
    nested: true,
  }),
  Subscript,
  Superscript,
];

const TiptapEditor = ({
  editable = true,
  content,
  onContentUpdate,
}: TiptapEditorProps) => {
  const editor = useEditor({
    extensions: tiptapExtensions, // ✅ Use ALL extensions
    content,
    immediatelyRender: false,
    editable,
    editorProps: {
      attributes: {
        class:
          "h-[55vh] border focus:outline-none border-slate-300 rounded-md max-h-[83vh] overflow-x-auto scrollbar-thin py-10 px-10 bg-slate-50 font-sans",
      },
    },
    onUpdate: ({ editor }) => {
      if (!onContentUpdate) return;
      const contentJson: any = editor.getJSON();
      onContentUpdate(contentJson);
    },
  });

  if (!editor) return null;

  return (
    <div className="flex flex-col gap-[5px]">
      {editable && (
        <div className="sticky top-0 z-10 bg-white border-[1px] shadow-white shadow-2xl border-gray-300 rounded-md">
          <MenuBar editor={editor} />
        </div>
      )}
      <EditorContent editor={editor} />
    </div>
  );
};

export default TiptapEditor;
