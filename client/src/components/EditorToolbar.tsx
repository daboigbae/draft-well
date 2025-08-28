import { Button } from "./ui/button";
import { Bold, Italic, Heading, List, ListOrdered, Link, Code } from "lucide-react";
import HashtagDropdown from "./HashtagDropdown";

interface EditorToolbarProps {
  onInsertMarkdown: (markdown: string) => void;
}

export default function EditorToolbar({ onInsertMarkdown }: EditorToolbarProps) {
  const formatButtons = [
    { icon: Bold, markdown: "**bold**", label: "Bold" },
    { icon: Italic, markdown: "_italic_", label: "Italic" },
    { icon: Heading, markdown: "# Heading", label: "Heading" },
    { icon: List, markdown: "- List item", label: "Bullet List" },
    { icon: ListOrdered, markdown: "1. Numbered item", label: "Numbered List" },
    { icon: Link, markdown: "[Link](url)", label: "Link" },
    { icon: Code, markdown: "`code`", label: "Code" },
  ];

  return (
    <div className="sticky top-0 z-10 bg-gray-50 border-b border-gray-200 p-4" data-testid="editor-toolbar">
      <div className="flex items-center gap-2">
        {formatButtons.map((button, index) => (
          <div key={button.label} className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onInsertMarkdown(button.markdown)}
              className="p-2 text-slate-600 hover:bg-white hover:shadow-sm"
              data-testid={`button-format-${button.label.toLowerCase().replace(' ', '-')}`}
            >
              <button.icon className="w-4 h-4" />
            </Button>
            {(index === 1 || index === 2 || index === 4) && (
              <div className="w-px h-6 bg-gray-300 mx-1" />
            )}
          </div>
        ))}
        
        <div className="w-px h-6 bg-gray-300 mx-1" />
        
        {/* Hashtag Collections Dropdown */}
        <HashtagDropdown onInsertHashtags={onInsertMarkdown} />
      </div>
    </div>
  );
}
