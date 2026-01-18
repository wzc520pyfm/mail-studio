/**
 * Social node renderer for Canvas mode
 * Displays a preview of social media links
 */

"use client";

import { memo } from "react";
import { Share2 } from "lucide-react";
import type { EditorNode } from "@/features/editor/types";

interface SocialNodeProps {
  node: EditorNode;
}

// Social platform configurations with icons and colors
const socialPlatforms: Record<string, { label: string; color: string; icon: string }> = {
  facebook: { label: "Facebook", color: "#1877f2", icon: "f" },
  "facebook-noshare": { label: "Facebook", color: "#1877f2", icon: "f" },
  twitter: { label: "Twitter", color: "#1da1f2", icon: "𝕏" },
  "twitter-noshare": { label: "Twitter", color: "#1da1f2", icon: "𝕏" },
  x: { label: "X", color: "#000000", icon: "𝕏" },
  "x-noshare": { label: "X", color: "#000000", icon: "𝕏" },
  linkedin: { label: "LinkedIn", color: "#0a66c2", icon: "in" },
  "linkedin-noshare": { label: "LinkedIn", color: "#0a66c2", icon: "in" },
  instagram: { label: "Instagram", color: "#e4405f", icon: "📷" },
  youtube: { label: "YouTube", color: "#ff0000", icon: "▶" },
  github: { label: "GitHub", color: "#333333", icon: "⌥" },
  "github-noshare": { label: "GitHub", color: "#333333", icon: "⌥" },
  pinterest: { label: "Pinterest", color: "#bd081c", icon: "P" },
  "pinterest-noshare": { label: "Pinterest", color: "#bd081c", icon: "P" },
  snapchat: { label: "Snapchat", color: "#fffc00", icon: "👻" },
  vimeo: { label: "Vimeo", color: "#1ab7ea", icon: "V" },
  tumblr: { label: "Tumblr", color: "#35465c", icon: "t" },
  "tumblr-noshare": { label: "Tumblr", color: "#35465c", icon: "t" },
  soundcloud: { label: "SoundCloud", color: "#ff5500", icon: "☁" },
  dribbble: { label: "Dribbble", color: "#ea4c89", icon: "🏀" },
  web: { label: "Web", color: "#4a4a4a", icon: "🌐" },
  medium: { label: "Medium", color: "#00ab6c", icon: "M" },
};

export const SocialNode = memo(function SocialNode({ node }: SocialNodeProps) {
  const children = node.children || [];
  const mode = (node.props.mode as string) || "horizontal";
  const iconSize = (node.props["icon-size"] as string) || "20px";
  const iconPadding = (node.props["icon-padding"] as string) || "4px";

  // Parse icon size for display
  const sizeNum = parseInt(iconSize, 10) || 20;
  const displaySize = Math.max(24, Math.min(48, sizeNum));

  return (
    <div className="py-2">
      <div className="border rounded-lg p-3 bg-white">
        <div className="flex items-center gap-2 mb-3">
          <Share2 className="w-4 h-4 text-gray-500" />
          <span className="text-xs font-medium text-gray-500">Social Links</span>
        </div>

        {children.length > 0 ? (
          <div
            className={
              mode === "vertical"
                ? "flex flex-col items-start gap-2"
                : "flex flex-wrap items-center gap-2"
            }
          >
            {children.map((child) => {
              const platformName = (child.props.name as string) || "web";
              const platform = socialPlatforms[platformName] || {
                label: platformName,
                color: "#666666",
                icon: "?",
              };
              const customSrc = child.props.src as string;

              return (
                <div
                  key={child.id}
                  className="flex items-center gap-2 group transition-transform hover:scale-105"
                  style={{ padding: iconPadding }}
                >
                  {customSrc ? (
                    <img
                      src={customSrc}
                      alt={platform.label}
                      className="rounded"
                      style={{ width: displaySize, height: displaySize }}
                    />
                  ) : (
                    <div
                      className="rounded flex items-center justify-center text-white font-bold shadow-sm"
                      style={{
                        backgroundColor: platform.color,
                        width: displaySize,
                        height: displaySize,
                        fontSize: displaySize * 0.5,
                      }}
                    >
                      {platform.icon}
                    </div>
                  )}
                  {mode === "vertical" && (
                    <span className="text-sm text-gray-600">{platform.label}</span>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-sm text-gray-400 italic text-center py-2">No social links added</div>
        )}
      </div>
    </div>
  );
});
