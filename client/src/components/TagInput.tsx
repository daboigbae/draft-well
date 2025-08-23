import { useState, useEffect, useRef } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { X, Plus } from "lucide-react";

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

export default function TagInput({ tags, onChange, placeholder = "Add tags (press Enter or comma to separate)" }: TagInputProps) {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const addTag = (tagText: string) => {
    const newTag = tagText.trim();
    if (newTag && !tags.includes(newTag)) {
      onChange([...tags, newTag]);
    }
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === ',' && inputValue.trim()) {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      // Remove last tag when backspacing with empty input
      const updatedTags = [...tags];
      updatedTags.pop();
      onChange(updatedTags);
    }
  };

  const handleInputChange = (value: string) => {
    // Handle comma-separated input
    if (value.includes(',')) {
      const parts = value.split(',');
      const newTags = parts.slice(0, -1).map(tag => tag.trim()).filter(tag => tag && !tags.includes(tag));
      if (newTags.length > 0) {
        onChange([...tags, ...newTags]);
      }
      setInputValue(parts[parts.length - 1].trim());
    } else {
      setInputValue(value);
    }
  };

  const removeTag = (tagToRemove: string) => {
    const updatedTags = tags.filter(tag => tag !== tagToRemove);
    onChange(updatedTags);
  };

  return (
    <div className="space-y-2" data-testid="tag-input">
      <Label htmlFor="tags">Tags</Label>
      <div className="flex gap-2">
        <Input
          ref={inputRef}
          id="tags"
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          data-testid="input-tags"
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addTag(inputValue)}
          disabled={!inputValue.trim()}
          data-testid="button-add-tag"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {tags.map((tag, index) => (
            <Badge
              key={`${tag}-${index}`}
              variant="secondary"
              className="flex items-center gap-1 px-2 py-1"
              data-testid={`badge-tag-${tag}`}
            >
              {tag}
              <X
                className="w-3 h-3 cursor-pointer hover:text-red-600 ml-1"
                onClick={() => removeTag(tag)}
                data-testid={`button-remove-tag-${tag}`}
              />
            </Badge>
          ))}
        </div>
      )}
      <p className="text-xs text-slate-500">
        Type tags and press Enter, comma, or click + to add. Press Backspace to remove the last tag.
      </p>
    </div>
  );
}
