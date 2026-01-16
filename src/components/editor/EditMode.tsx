"use client";

import { useCallback, useState, useRef } from "react";
import { useEditorStore } from "@/stores/editor";
import { EditorNode, MJMLComponentType } from "@/types/editor";
import { componentDefinitions, createNode, generateId } from "@/lib/mjml/schema";
import { cn } from "@/lib/utils";
import {
  Bold,
  Italic,
  Underline,
  Link,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Type,
  Image,
  Minus,
  MousePointerClick,
  Plus,
  GripVertical,
  Trash2,
  Table,
  Share2,
  Menu,
  ChevronDown,
  ChevronUp,
  GalleryHorizontal,
  LayoutTemplate,
  Code,
  MoveVertical,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function EditMode() {
  const document = useEditorStore((s) => s.document);

  return (
    <div className="h-full bg-white overflow-auto">
      <div className="max-w-[650px] mx-auto py-12 px-8">
        {/* Email Header */}
        <div className="mb-8 pb-6 border-b border-gray-200">
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
            <span className="w-16">From</span>
            <input
              type="text"
              placeholder="Your Name <email@example.com>"
              className="flex-1 bg-transparent outline-none text-gray-900 placeholder:text-gray-400"
            />
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
            <span className="w-16">To</span>
            <input
              type="text"
              placeholder="Recipient(s)"
              className="flex-1 bg-transparent outline-none text-gray-900 placeholder:text-gray-400"
            />
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="w-16">Subject</span>
            <input
              type="text"
              placeholder="Email subject"
              className="flex-1 bg-transparent outline-none text-gray-900 font-medium placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Email Body */}
        <div className="space-y-1">
          {document.children?.map((section) => (
            <EditSection key={section.id} node={section} />
          ))}
          <AddBlockButton parentId={document.id} />
        </div>
      </div>
    </div>
  );
}

function EditSection({ node }: { node: EditorNode }) {
  // Handle different section types
  if (node.type === "mj-hero") {
    return <EditHero node={node} />;
  }

  if (node.type === "mj-wrapper") {
    return (
      <div className="space-y-1 p-2 bg-gray-50/50 rounded-lg border border-dashed border-gray-200">
        {node.children?.map((section) => (
          <EditSection key={section.id} node={section} />
        ))}
      </div>
    );
  }

  // Handle mj-group inside section
  return (
    <div className="space-y-1">
      {node.children?.map((child) => {
        if (child.type === "mj-group") {
          return (
            <div key={child.id} className="flex gap-2">
              {child.children?.map((column) => (
                <div key={column.id} className="flex-1">
                  <EditColumn node={column} parentId={child.id} />
                </div>
              ))}
            </div>
          );
        }
        return (
          <EditColumn key={child.id} node={child} parentId={node.id} />
        );
      })}
    </div>
  );
}

function EditHero({ node }: { node: EditorNode }) {
  const { selectedId, setSelectedId } = useEditorStore();
  const isSelected = selectedId === node.id;
  const bgColor = (node.props["background-color"] as string) || "#1e293b";
  const bgImage = node.props["background-url"] as string;

  return (
    <div
      className={cn(
        "relative rounded-lg overflow-hidden my-2 transition-all",
        isSelected ? "ring-2 ring-blue-200" : ""
      )}
      style={{
        backgroundColor: bgColor,
        backgroundImage: bgImage ? `url(${bgImage})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: (node.props["height"] as string) || "300px",
      }}
      onClick={() => setSelectedId(node.id)}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
        {node.children?.map((child) => (
          <EditBlock key={child.id} node={child} parentId={node.id} />
        ))}
      </div>

      {/* Hero label */}
      <div className="absolute top-2 left-2 px-2 py-1 bg-black/50 rounded text-xs text-white flex items-center gap-1">
        <LayoutTemplate className="w-3 h-3" />
        Hero
      </div>
    </div>
  );
}

function EditColumn({
  node,
  parentId,
}: {
  node: EditorNode;
  parentId: string;
}) {
  return (
    <div className="space-y-1">
      {node.children?.map((child) => (
        <EditBlock key={child.id} node={child} parentId={node.id} />
      ))}
      <AddBlockButton parentId={node.id} />
    </div>
  );
}

function EditBlock({ node, parentId }: { node: EditorNode; parentId: string }) {
  const [isHovered, setIsHovered] = useState(false);
  const { removeNode, selectedId, setSelectedId } = useEditorStore();
  const isSelected = selectedId === node.id;

  const handleDelete = useCallback(() => {
    removeNode(node.id);
  }, [node.id, removeNode]);

  return (
    <div
      className={cn(
        "group relative rounded-lg transition-all duration-150",
        isHovered && "bg-gray-50",
        isSelected && "bg-blue-50/50 ring-2 ring-blue-200"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => setSelectedId(node.id)}
    >
      {/* Block Controls */}
      <div
        className={cn(
          "absolute -left-10 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 transition-opacity",
          (isHovered || isSelected) && "opacity-100"
        )}
      >
        <button
          className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600 cursor-grab"
          title="Drag to reorder"
        >
          <GripVertical className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDelete();
          }}
          className="p-1 rounded hover:bg-red-100 text-gray-400 hover:text-red-500"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Block Content */}
      <div className="py-1">
        {node.type === "mj-text" && <EditableText node={node} />}
        {node.type === "mj-image" && <EditableImage node={node} />}
        {node.type === "mj-button" && <EditableButton node={node} />}
        {node.type === "mj-divider" && <EditableDivider node={node} />}
        {node.type === "mj-spacer" && <EditableSpacer node={node} />}
        {node.type === "mj-table" && <EditableTable node={node} />}
        {node.type === "mj-social" && <EditableSocial node={node} />}
        {node.type === "mj-navbar" && <EditableNavbar node={node} />}
        {node.type === "mj-accordion" && <EditableAccordion node={node} />}
        {node.type === "mj-carousel" && <EditableCarousel node={node} />}
        {node.type === "mj-raw" && <EditableRaw node={node} />}
      </div>
    </div>
  );
}

function EditableText({ node }: { node: EditorNode }) {
  const { updateNodeContent, updateNodeProps, selectedId } = useEditorStore();
  const [showToolbar, setShowToolbar] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const isSelected = selectedId === node.id;

  const handleInput = useCallback(() => {
    if (contentRef.current) {
      updateNodeContent(node.id, contentRef.current.innerHTML);
    }
  }, [node.id, updateNodeContent]);

  const handleFocus = () => setShowToolbar(true);
  const handleBlur = () => {
    // Delay hiding to allow toolbar click
    setTimeout(() => setShowToolbar(false), 200);
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    handleInput();
  };

  const style = {
    fontSize: (node.props["font-size"] as string) || "16px",
    fontWeight: node.props["font-weight"] as string,
    fontFamily: node.props["font-family"] as string,
    color: (node.props["color"] as string) || "#333",
    lineHeight: (node.props["line-height"] as string) || "1.6",
    textAlign: node.props["align"] as "left" | "center" | "right",
  };

  return (
    <div className="relative">
      {/* Floating Toolbar */}
      {(showToolbar || isSelected) && (
        <div className="absolute -top-10 left-0 z-50 flex items-center gap-1 p-1 bg-white rounded-lg shadow-lg border border-gray-200">
          <button
            onClick={() => execCommand("bold")}
            className="p-1.5 rounded hover:bg-gray-100"
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onClick={() => execCommand("italic")}
            className="p-1.5 rounded hover:bg-gray-100"
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            onClick={() => execCommand("underline")}
            className="p-1.5 rounded hover:bg-gray-100"
            title="Underline"
          >
            <Underline className="w-4 h-4" />
          </button>
          <div className="w-px h-5 bg-gray-200 mx-1" />
          <button
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
          <button
            onClick={() => {
              const url = prompt("Enter URL:");
              if (url) execCommand("createLink", url);
            }}
            className="p-1.5 rounded hover:bg-gray-100"
            title="Add Link"
          >
            <Link className="w-4 h-4" />
          </button>
        </div>
      )}

      <div
        ref={contentRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className="outline-none min-h-[1.6em] px-2 py-1"
        style={style}
        dangerouslySetInnerHTML={{ __html: node.content || "" }}
      />
    </div>
  );
}

function EditableImage({ node }: { node: EditorNode }) {
  const { updateNodeProps } = useEditorStore();
  const [isEditing, setIsEditing] = useState(false);

  const src = node.props["src"] as string;
  const alt = (node.props["alt"] as string) || "";
  const align = (node.props["align"] as string) || "center";

  return (
    <div
      className="py-2"
      style={{ textAlign: align as "left" | "center" | "right" }}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className="max-w-full h-auto rounded-lg cursor-pointer hover:ring-2 hover:ring-blue-200"
          style={{ display: "inline-block" }}
          onClick={() => setIsEditing(true)}
        />
      ) : (
        <button
          onClick={() => {
            const url = prompt("Enter image URL:");
            if (url) updateNodeProps(node.id, { src: url });
          }}
          className="w-full py-8 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
        >
          <Image className="w-8 h-8 mx-auto mb-2" />
          Click to add image
        </button>
      )}
    </div>
  );
}

function EditableButton({ node }: { node: EditorNode }) {
  const { updateNodeContent, updateNodeProps, selectedId } = useEditorStore();
  const [showToolbar, setShowToolbar] = useState(false);
  const isSelected = selectedId === node.id;

  const bgColor = (node.props["background-color"] as string) || "#2563eb";
  const textColor = (node.props["color"] as string) || "#ffffff";
  const borderRadius = (node.props["border-radius"] as string) || "6px";
  const align = (node.props["align"] as string) || "center";

  return (
    <div
      className="relative py-2"
      style={{ textAlign: align as "left" | "center" | "right" }}
    >
      {/* Button Toolbar */}
      {(showToolbar || isSelected) && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 p-1 bg-white rounded-lg shadow-lg border border-gray-200">
          <select
            value={borderRadius}
            onChange={(e) =>
              updateNodeProps(node.id, { "border-radius": e.target.value })
            }
            className="text-sm px-2 py-1 rounded border-0 bg-gray-50"
          >
            <option value="0">Square</option>
            <option value="6px">Round</option>
            <option value="9999px">Pill</option>
          </select>
          <div className="w-px h-5 bg-gray-200 mx-1" />
          <input
            type="color"
            value={bgColor}
            onChange={(e) =>
              updateNodeProps(node.id, { "background-color": e.target.value })
            }
            className="w-6 h-6 rounded cursor-pointer"
            title="Background Color"
          />
          <input
            type="color"
            value={textColor}
            onChange={(e) =>
              updateNodeProps(node.id, { color: e.target.value })
            }
            className="w-6 h-6 rounded cursor-pointer"
            title="Text Color"
          />
          <div className="w-px h-5 bg-gray-200 mx-1" />
          <button
            onClick={() => {
              const url = prompt(
                "Enter button URL:",
                (node.props["href"] as string) || ""
              );
              if (url !== null) updateNodeProps(node.id, { href: url });
            }}
            className="p-1.5 rounded hover:bg-gray-100"
            title="Edit Link"
          >
            <Link className="w-4 h-4" />
          </button>
        </div>
      )}

      <span
        contentEditable
        suppressContentEditableWarning
        onFocus={() => setShowToolbar(true)}
        onBlur={(e) => {
          setTimeout(() => setShowToolbar(false), 200);
          updateNodeContent(node.id, e.currentTarget.textContent || "");
        }}
        className="inline-block px-6 py-3 font-medium outline-none cursor-text"
        style={{
          backgroundColor: bgColor,
          color: textColor,
          borderRadius,
        }}
      >
        {node.content || "Button"}
      </span>
    </div>
  );
}

function EditableDivider({ node }: { node: EditorNode }) {
  const borderColor = (node.props["border-color"] as string) || "#e2e8f0";
  const borderWidth = (node.props["border-width"] as string) || "1px";

  return (
    <div className="py-4">
      <hr
        style={{
          borderColor,
          borderWidth,
          borderStyle: "solid",
        }}
      />
    </div>
  );
}

function EditableSpacer({ node }: { node: EditorNode }) {
  const height = (node.props["height"] as string) || "30px";

  return (
    <div
      className="flex items-center justify-center text-gray-400 text-xs"
      style={{ height }}
    >
      <MoveVertical className="w-3 h-3 mr-1" />
      {height}
    </div>
  );
}

function EditableTable({ node }: { node: EditorNode }) {
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
            <table
              className="w-full text-sm"
              dangerouslySetInnerHTML={{ __html: node.content }}
            />
          ) : (
            <div className="text-gray-400 text-sm text-center py-4">
              Click to edit table
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EditableSocial({ node }: { node: EditorNode }) {
  const { updateNodeChildren, selectedId, setSelectedId, addChildNode, removeNode } = useEditorStore();
  const isSelected = selectedId === node.id;
  const children = node.children || [];

  const socialPlatforms = [
    { name: "facebook", label: "Facebook", color: "#3b5998" },
    { name: "twitter", label: "Twitter", color: "#1da1f2" },
    { name: "linkedin", label: "LinkedIn", color: "#0077b5" },
    { name: "instagram", label: "Instagram", color: "#e4405f" },
    { name: "youtube", label: "YouTube", color: "#ff0000" },
    { name: "github", label: "GitHub", color: "#333" },
  ];

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
            const platform = socialPlatforms.find(
              (p) => p.name === child.props.name
            );
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

function EditableNavbar({ node }: { node: EditorNode }) {
  const { updateNodeContent, updateNodeProps, addChildNode, removeNode, selectedId, setSelectedId } = useEditorStore();
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
            <div
              key={child.id}
              className="group relative flex items-center"
            >
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

function EditableAccordion({ node }: { node: EditorNode }) {
  const { addChildNode, removeNode, selectedId, setSelectedId } = useEditorStore();
  const isSelected = selectedId === node.id;
  const children = node.children || [];
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const handleAddItem = () => {
    const newItem: EditorNode = {
      id: generateId(),
      type: "mj-accordion-element",
      props: {},
      children: [
        {
          id: generateId(),
          type: "mj-accordion-title",
          props: { "background-color": "#f8fafc", padding: "15px" },
          content: "New Accordion Title",
        },
        {
          id: generateId(),
          type: "mj-accordion-text",
          props: { "background-color": "#ffffff", padding: "15px" },
          content: "Accordion content goes here.",
        },
      ],
    };
    addChildNode(node.id, newItem);
  };

  return (
    <div className="py-2">
      <div
        className={cn(
          "border rounded-lg overflow-hidden transition-all",
          isSelected ? "ring-2 ring-blue-200" : "hover:border-gray-300"
        )}
        onClick={() => setSelectedId(node.id)}
      >
        <div className="bg-gray-50 px-3 py-2 border-b flex items-center gap-2">
          <ChevronDown className="w-4 h-4 text-gray-500" />
          <span className="text-xs font-medium text-gray-600">Accordion</span>
        </div>

        <div className="divide-y">
          {children.map((element) => {
            const titleChild = element.children?.find(
              (c) => c.type === "mj-accordion-title"
            );
            const textChild = element.children?.find(
              (c) => c.type === "mj-accordion-text"
            );
            const isExpanded = expandedItems.has(element.id);

            return (
              <div key={element.id} className="group">
                <div
                  className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-gray-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleItem(element.id);
                  }}
                >
                  <div className="flex items-center gap-2">
                    <ChevronRight
                      className={cn(
                        "w-4 h-4 text-gray-400 transition-transform",
                        isExpanded && "rotate-90"
                      )}
                    />
                    <span className="text-sm">
                      {titleChild?.content || "Accordion Item"}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeNode(element.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded"
                  >
                    <Trash2 className="w-3 h-3 text-gray-400" />
                  </button>
                </div>
                {isExpanded && (
                  <div className="px-3 py-2 bg-gray-50 text-sm text-gray-600 border-t">
                    {textChild?.content || "Content"}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="px-3 py-2 border-t">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAddItem();
            }}
            className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            Add accordion item
          </button>
        </div>
      </div>
    </div>
  );
}

function EditableCarousel({ node }: { node: EditorNode }) {
  const { addChildNode, removeNode, updateNodeProps, selectedId, setSelectedId } = useEditorStore();
  const isSelected = selectedId === node.id;
  const children = node.children || [];
  const [activeIndex, setActiveIndex] = useState(0);

  const handleAddSlide = () => {
    const newSlide: EditorNode = {
      id: generateId(),
      type: "mj-carousel-image",
      props: {
        src: "https://placehold.co/600x300/e2e8f0/64748b?text=New+Slide",
        alt: "New slide",
      },
    };
    addChildNode(node.id, newSlide);
  };

  return (
    <div className="py-2">
      <div
        className={cn(
          "border rounded-lg overflow-hidden transition-all",
          isSelected ? "ring-2 ring-blue-200" : "hover:border-gray-300"
        )}
        onClick={() => setSelectedId(node.id)}
      >
        <div className="bg-gray-50 px-3 py-2 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GalleryHorizontal className="w-4 h-4 text-gray-500" />
            <span className="text-xs font-medium text-gray-600">Carousel</span>
          </div>
          <span className="text-xs text-gray-400">
            {children.length} slides
          </span>
        </div>

        {children.length > 0 ? (
          <div className="relative">
            <div className="aspect-[2/1] bg-gray-100">
              {children[activeIndex] && (
                <img
                  src={children[activeIndex].props.src as string}
                  alt={children[activeIndex].props.alt as string || ""}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            
            {/* Navigation dots */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {children.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveIndex(index);
                  }}
                  className={cn(
                    "w-2 h-2 rounded-full transition-colors",
                    index === activeIndex ? "bg-white" : "bg-white/50"
                  )}
                />
              ))}
            </div>

            {/* Prev/Next buttons */}
            {children.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveIndex((i) => (i > 0 ? i - 1 : children.length - 1));
                  }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveIndex((i) => (i < children.length - 1 ? i + 1 : 0));
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-400">
            No slides yet
          </div>
        )}

        {/* Slide management */}
        <div className="px-3 py-2 border-t bg-gray-50">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {children.map((slide, index) => (
              <div
                key={slide.id}
                className={cn(
                  "relative flex-shrink-0 w-16 h-10 rounded border cursor-pointer overflow-hidden",
                  index === activeIndex ? "ring-2 ring-blue-400" : ""
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveIndex(index);
                }}
              >
                <img
                  src={slide.props.src as string}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeNode(slide.id);
                    if (activeIndex >= children.length - 1) {
                      setActiveIndex(Math.max(0, children.length - 2));
                    }
                  }}
                  className="absolute top-0 right-0 p-0.5 bg-red-500 text-white opacity-0 hover:opacity-100"
                >
                  <Trash2 className="w-2 h-2" />
                </button>
              </div>
            ))}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAddSlide();
              }}
              className="flex-shrink-0 w-16 h-10 rounded border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-gray-400 hover:text-gray-500"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EditableRaw({ node }: { node: EditorNode }) {
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
          "border rounded-lg overflow-hidden cursor-pointer transition-all",
          isSelected ? "ring-2 ring-blue-200" : "hover:border-gray-300"
        )}
        onClick={() => setIsEditing(true)}
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

function AddBlockButton({ parentId }: { parentId: string }) {
  const { addNode, findNode } = useEditorStore();
  const [isOpen, setIsOpen] = useState(false);

  // Find the correct parent for adding blocks
  const getTargetParentId = () => {
    const parent = findNode(parentId);
    if (!parent) return parentId;

    // If parent is body, we need to add to a column inside a section
    if (parent.type === "mj-body") {
      // Find first column in first section
      const section = parent.children?.[0];
      if (section?.type === "mj-section") {
        const column = section.children?.[0];
        if (column?.type === "mj-column") {
          return column.id;
        }
      }
    }
    return parentId;
  };

  const handleAddBlock = (type: MJMLComponentType) => {
    const targetId = getTargetParentId();
    addNode(targetId, type);
    setIsOpen(false);
  };

  const blockTypes = [
    { type: "mj-text" as const, icon: Type, label: "Text", category: "content" },
    { type: "mj-image" as const, icon: Image, label: "Image", category: "content" },
    { type: "mj-button" as const, icon: MousePointerClick, label: "Button", category: "interactive" },
    { type: "mj-divider" as const, icon: Minus, label: "Divider", category: "content" },
    { type: "mj-spacer" as const, icon: MoveVertical, label: "Spacer", category: "content" },
    { type: "mj-table" as const, icon: Table, label: "Table", category: "content" },
    { type: "mj-social" as const, icon: Share2, label: "Social", category: "interactive" },
    { type: "mj-navbar" as const, icon: Menu, label: "Navbar", category: "interactive" },
    { type: "mj-accordion" as const, icon: ChevronDown, label: "Accordion", category: "interactive" },
    { type: "mj-carousel" as const, icon: GalleryHorizontal, label: "Carousel", category: "interactive" },
    { type: "mj-raw" as const, icon: Code, label: "Raw HTML", category: "content" },
  ];

  const contentBlocks = blockTypes.filter((b) => b.category === "content");
  const interactiveBlocks = blockTypes.filter((b) => b.category === "interactive");

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "w-full py-2 flex items-center justify-center gap-2 text-gray-400 rounded-lg transition-all",
            "hover:bg-gray-50 hover:text-gray-600",
            "opacity-0 hover:opacity-100 focus:opacity-100",
            isOpen && "opacity-100 bg-gray-50"
          )}
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm">Add block</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="start">
        <div className="space-y-2">
          <div>
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wider px-2 mb-1">
              Content
            </div>
            <div className="space-y-0.5">
              {contentBlocks.map(({ type, icon: Icon, label }) => (
                <button
                  key={type}
                  onClick={() => handleAddBlock(type)}
                  className="w-full flex items-center gap-3 px-3 py-1.5 text-sm rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Icon className="w-4 h-4 text-gray-500" />
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="border-t pt-2">
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wider px-2 mb-1">
              Interactive
            </div>
            <div className="space-y-0.5">
              {interactiveBlocks.map(({ type, icon: Icon, label }) => (
                <button
                  key={type}
                  onClick={() => handleAddBlock(type)}
                  className="w-full flex items-center gap-3 px-3 py-1.5 text-sm rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Icon className="w-4 h-4 text-gray-500" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
