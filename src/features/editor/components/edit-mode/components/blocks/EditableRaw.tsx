"use client";

import { useState } from "react";
import { useEditorStore } from "@/features/editor/stores";
import type { EditorNode } from "@/features/editor/types";
import { cn } from "@/lib/utils";
import { Code } from "lucide-react";

interface EditableRawProps {
  node: EditorNode;
  isLocked?: boolean;
}

export function EditableRaw({ node, isLocked = false }: EditableRawProps) {
  const { updateNodeContent, selectedId } = useEditorStore();
  const isSelected = selectedId === node.id;
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(node.content || "");

  const handleSave = () => {
    updateNodeContent(node.id, editContent);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="py-2">
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-gray-800 px-3 py-2 flex items-center justify-between">
            <span className="text-xs font-medium text-gray-300">
              <Code className="w-3 h-3 inline mr-1" />
              Raw HTML
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="text-xs px-2 py-1 rounded text-gray-300 hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="text-xs px-2 py-1 rounded bg-blue-500 text-white hover:bg-blue-600"
              >
                Save
              </button>
            </div>
          </div>
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full h-48 p-3 text-xs font-mono bg-gray-900 text-gray-100 outline-none resize-none"
            placeholder="<!-- Your HTML here -->"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="py-2">
      <div
        className={cn(
          "border rounded-lg overflow-hidden transition-all",
          isLocked ? "cursor-not-allowed" : "cursor-pointer",
          isSelected
            ? isLocked
              ? "ring-2 ring-amber-200"
              : "ring-2 ring-blue-200"
            : "hover:border-gray-300"
        )}
        onClick={isLocked ? undefined : () => setIsEditing(true)}
      >
        <div className="bg-gray-800 px-3 py-2">
          <span className="text-xs font-medium text-gray-300">
            <Code className="w-3 h-3 inline mr-1" />
            Raw HTML
          </span>
        </div>
        <div className="p-3 bg-gray-900">
          <pre className="text-xs font-mono text-gray-400 whitespace-pre-wrap max-h-24 overflow-hidden">
            {node.content || "<!-- Click to edit -->"}
          </pre>
        </div>
      </div>
    </div>
  );
}
