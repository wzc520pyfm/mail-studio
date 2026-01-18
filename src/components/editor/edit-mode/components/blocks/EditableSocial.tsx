"use client";

import { useEditorStore } from "@/stores/editor";
import { EditorNode } from "@/types/editor";
import { generateId } from "@/lib/mjml/schema";
import { cn } from "@/lib/utils";
import { Share2, Plus, Trash2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface EditableSocialProps {
  node: EditorNode;
}

const socialPlatforms = [
  { name: "facebook", label: "Facebook", color: "#3b5998" },
  { name: "twitter", label: "Twitter", color: "#1da1f2" },
  { name: "linkedin", label: "LinkedIn", color: "#0077b5" },
  { name: "instagram", label: "Instagram", color: "#e4405f" },
  { name: "youtube", label: "YouTube", color: "#ff0000" },
  { name: "github", label: "GitHub", color: "#333" },
];

export function EditableSocial({ node }: EditableSocialProps) {
  const { selectedId, setSelectedId, addChildNode, removeNode } = useEditorStore();
  const isSelected = selectedId === node.id;
  const children = node.children || [];

  const handleAddSocial = (platformName: string) => {
    const newElement: EditorNode = {
      id: generateId(),
      type: "mj-social-element",
      props: { name: platformName, href: "#" },
    };
    addChildNode(node.id, newElement);
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
          <Share2 className="w-4 h-4 text-gray-500" />
          <span className="text-xs font-medium text-gray-600">Social Links</span>
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          {children.map((child) => {
            const platform = socialPlatforms.find((p) => p.name === child.props.name);
            return (
              <div
                key={child.id}
                className="group relative flex items-center gap-1 px-2 py-1 rounded text-xs text-white"
                style={{ backgroundColor: platform?.color || "#666" }}
              >
                {platform?.label || child.props.name}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeNode(child.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 ml-1 hover:bg-white/20 rounded"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <button className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1">
              <Plus className="w-3 h-3" />
              Add social link
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-40 p-2" align="start">
            {socialPlatforms.map((platform) => (
              <button
                key={platform.name}
                onClick={() => handleAddSocial(platform.name)}
                className="w-full text-left px-2 py-1 text-sm rounded hover:bg-gray-100"
              >
                {platform.label}
              </button>
            ))}
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
