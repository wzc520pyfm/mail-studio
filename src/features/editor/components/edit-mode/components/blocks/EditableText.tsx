"use client";

import { useCallback, useState, useRef, useEffect } from "react";
import { useEditorStore } from "@/features/editor/stores";
import type { EditorNode } from "@/features/editor/types";
import { cn } from "@/lib/utils";
import { Bold, Italic, Underline, Link, AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface EditableTextProps {
  node: EditorNode;
  isLocked?: boolean;
}

export function EditableText({ node, isLocked = false }: EditableTextProps) {
  const { updateNodeContent, updateNodeProps, selectedId } = useEditorStore();
  const [showToolbar, setShowToolbar] = useState(false);
  const [linkPopoverOpen, setLinkPopoverOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const contentRef = useRef<HTMLDivElement>(null);
  const linkPopoverOpenRef = useRef(false);
  const isSelected = selectedId === node.id;
  const initialContentRef = useRef(node.content || "");

  // Keep ref in sync with state
  useEffect(() => {
    linkPopoverOpenRef.current = linkPopoverOpen;
  }, [linkPopoverOpen]);

  useEffect(() => {
    if (contentRef.current && contentRef.current.innerHTML !== node.content) {
      if (document.activeElement !== contentRef.current) {
        contentRef.current.innerHTML = node.content || "";
      }
    }
  }, [node.id, node.content]);

  const handleInput = useCallback(() => {
    if (contentRef.current) {
      updateNodeContent(node.id, contentRef.current.innerHTML);
    }
  }, [node.id, updateNodeContent]);

  const handleFocus = () => setShowToolbar(true);

  const handleBlur = useCallback(() => {
    // Don't close toolbar if link popover is open (use ref for latest value)
    if (linkPopoverOpenRef.current) return;

    if (contentRef.current) {
      updateNodeContent(node.id, contentRef.current.innerHTML);
    }
    setTimeout(() => {
      // Check again in case popover opened during the timeout
      if (!linkPopoverOpenRef.current) {
        setShowToolbar(false);
      }
    }, 200);
  }, [node.id, updateNodeContent]);

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    handleInput();
  };

  const containerStyle = {
    backgroundColor: node.props["container-background-color"] as string,
    padding: (node.props["padding"] as string) || "10px 25px",
  };

  const style = {
    fontSize: (node.props["font-size"] as string) || "13px",
    fontWeight: node.props["font-weight"] as string,
    fontFamily: node.props["font-family"] as string,
    fontStyle: node.props["font-style"] as string,
    color: (node.props["color"] as string) || "#000000",
    lineHeight: (node.props["line-height"] as string) || "1.5",
    letterSpacing: node.props["letter-spacing"] as string,
    textAlign: (node.props["align"] as "left" | "center" | "right") || "left",
    textDecoration: node.props["text-decoration"] as string,
    textTransform: node.props["text-transform"] as
      | "none"
      | "capitalize"
      | "uppercase"
      | "lowercase",
  };

  return (
    <div className="relative" style={containerStyle}>
      {!isLocked && (showToolbar || isSelected) && (
        <div className="absolute -top-10 left-0 z-50 flex items-center gap-1 p-1 bg-white rounded-lg shadow-lg border border-gray-200">
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => execCommand("bold")}
            className="p-1.5 rounded hover:bg-gray-100"
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => execCommand("italic")}
            className="p-1.5 rounded hover:bg-gray-100"
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => execCommand("underline")}
            className="p-1.5 rounded hover:bg-gray-100"
            title="Underline"
          >
            <Underline className="w-4 h-4" />
          </button>
          <div className="w-px h-5 bg-gray-200 mx-1" />
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => updateNodeProps(node.id, { align: "left" })}
            className={cn(
              "p-1.5 rounded hover:bg-gray-100",
              node.props["align"] === "left" && "bg-gray-100"
            )}
            title="Align Left"
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => updateNodeProps(node.id, { align: "center" })}
            className={cn(
              "p-1.5 rounded hover:bg-gray-100",
              node.props["align"] === "center" && "bg-gray-100"
            )}
            title="Align Center"
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => updateNodeProps(node.id, { align: "right" })}
            className={cn(
              "p-1.5 rounded hover:bg-gray-100",
              node.props["align"] === "right" && "bg-gray-100"
            )}
            title="Align Right"
          >
            <AlignRight className="w-4 h-4" />
          </button>
          <div className="w-px h-5 bg-gray-200 mx-1" />
          <Popover
            open={linkPopoverOpen}
            onOpenChange={(open) => {
              setLinkPopoverOpen(open);
              linkPopoverOpenRef.current = open;
            }}
          >
            <PopoverTrigger asChild>
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  // Set ref immediately on mousedown (before blur fires)
                  linkPopoverOpenRef.current = true;
                }}
                className="p-1.5 rounded hover:bg-gray-100"
                title="Add Link"
              >
                <Link className="w-4 h-4" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-3" align="start" sideOffset={8}>
              <div className="space-y-3">
                <div className="text-sm font-medium text-gray-700">Enter URL</div>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && linkUrl) {
                      execCommand("createLink", linkUrl);
                      setLinkUrl("");
                      setLinkPopoverOpen(false);
                    }
                  }}
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setLinkUrl("");
                      setLinkPopoverOpen(false);
                    }}
                    className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (linkUrl) {
                        execCommand("createLink", linkUrl);
                        setLinkUrl("");
                        setLinkPopoverOpen(false);
                      }
                    }}
                    className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      )}

      <div
        ref={(el) => {
          contentRef.current = el;
          if (el && !el.innerHTML) {
            el.innerHTML = initialContentRef.current;
          }
        }}
        contentEditable={!isLocked}
        suppressContentEditableWarning
        onInput={isLocked ? undefined : handleInput}
        onFocus={isLocked ? undefined : handleFocus}
        onBlur={isLocked ? undefined : handleBlur}
        className={cn(
          "outline-none min-h-[1.6em] px-2 py-1 rounded focus:ring-2 focus:ring-white/30 [&_a]:text-blue-600 [&_a]:underline [&_a]:cursor-pointer",
          isLocked && "cursor-not-allowed"
        )}
        style={style}
      />
    </div>
  );
}
