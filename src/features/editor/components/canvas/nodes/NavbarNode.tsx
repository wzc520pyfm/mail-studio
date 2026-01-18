/**
 * Navbar node renderer for Canvas mode
 * Displays a preview of navigation links
 */

"use client";

import { memo } from "react";
import { Menu } from "lucide-react";
import type { EditorNode } from "@/features/editor/types";

interface NavbarNodeProps {
  node: EditorNode;
}

export const NavbarNode = memo(function NavbarNode({ node }: NavbarNodeProps) {
  const children = node.children || [];
  const baseColor = (node.props["base-url"] as string) || "#333333";

  return (
    <div className="py-2">
      <div className="border rounded-lg p-3 bg-white">
        <div className="flex items-center gap-2 mb-2">
          <Menu className="w-4 h-4 text-gray-500" />
          <span className="text-xs font-medium text-gray-500">Navigation Bar</span>
        </div>

        {children.length > 0 ? (
          <div className="flex flex-wrap items-center gap-3">
            {children.map((child) => {
              const linkColor = (child.props.color as string) || baseColor;
              return (
                <span
                  key={child.id}
                  className="px-3 py-1 text-sm font-medium rounded hover:bg-gray-50 transition-colors"
                  style={{ color: linkColor }}
                >
                  {child.content || "Link"}
                </span>
              );
            })}
          </div>
        ) : (
          <div className="text-sm text-gray-400 italic">No navigation links</div>
        )}
      </div>
    </div>
  );
});
