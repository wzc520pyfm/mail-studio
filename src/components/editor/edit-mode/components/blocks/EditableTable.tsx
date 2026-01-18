"use client";

import { useState } from "react";
import { useEditorStore } from "@/stores/editor";
import { EditorNode } from "@/types/editor";
import { cn } from "@/lib/utils";
import { Table } from "lucide-react";

interface EditableTableProps {
  node: EditorNode;
}

export function EditableTable({ node }: EditableTableProps) {
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
          <div className="bg-gray-50 px-3 py-2 border-b flex items-center justify-between">
            <span className="text-xs font-medium text-gray-600">
              <Table className="w-3 h-3 inline mr-1" />
              Edit Table HTML
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="text-xs px-2 py-1 rounded hover:bg-gray-200"
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
            className="w-full h-48 p-3 text-xs font-mono outline-none resize-none"
            placeholder="<tr><td>Cell 1</td><td>Cell 2</td></tr>"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="py-2">
      <div
        className={cn(
          "border rounded-lg overflow-hidden cursor-pointer transition-all",
          isSelected ? "ring-2 ring-blue-200" : "hover:border-gray-300"
        )}
        onClick={() => setIsEditing(true)}
      >
        <div className="bg-gray-50 px-3 py-2 border-b">
          <span className="text-xs font-medium text-gray-600">
            <Table className="w-3 h-3 inline mr-1" />
            Table
          </span>
        </div>
        <div className="p-3">
          {node.content ? (
            <table className="w-full text-sm" dangerouslySetInnerHTML={{ __html: node.content }} />
          ) : (
            <div className="text-gray-400 text-sm text-center py-4">Click to edit table</div>
          )}
        </div>
      </div>
    </div>
  );
}
