"use client";

import { useEditorStore } from "@/stores/editor";
import { EditorNode } from "@/types/editor";
import { generateId } from "@/lib/mjml/schema";
import { cn } from "@/lib/utils";
import { Menu, Plus, Trash2 } from "lucide-react";

interface EditableNavbarProps {
  node: EditorNode;
}

export function EditableNavbar({ node }: EditableNavbarProps) {
  const { addChildNode, removeNode, selectedId, setSelectedId } = useEditorStore();
  const isSelected = selectedId === node.id;
  const children = node.children || [];

  const handleAddLink = () => {
    const newLink: EditorNode = {
      id: generateId(),
      type: "mj-navbar-link",
      props: { href: "#", color: "#333333" },
      content: "New Link",
    };
    addChildNode(node.id, newLink);
  };

  return (
    <div className="py-2">
      <div
        className={cn(
          "border rounded-lg p-3 transition-all",
          isSelected ? "ring-2 ring-blue-200" : "hover:border-gray-300"
        )}
        onClick={() => setSelectedId(node.id)}
      >
        <div className="flex items-center gap-2 mb-2">
          <Menu className="w-4 h-4 text-gray-500" />
          <span className="text-xs font-medium text-gray-600">Navigation Bar</span>
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          {children.map((child) => (
            <div key={child.id} className="group relative flex items-center">
              <input
                type="text"
                value={child.content || ""}
                onChange={(e) => {
                  const { updateNodeContent } = useEditorStore.getState();
                  updateNodeContent(child.id, e.target.value);
                }}
                className="px-3 py-1 text-sm border rounded hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
                onClick={(e) => e.stopPropagation()}
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeNode(child.id);
                }}
                className="opacity-0 group-hover:opacity-100 ml-1 p-1 hover:bg-gray-100 rounded"
              >
                <Trash2 className="w-3 h-3 text-gray-400" />
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleAddLink();
          }}
          className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
        >
          <Plus className="w-3 h-3" />
          Add link
        </button>
      </div>
    </div>
  );
}
