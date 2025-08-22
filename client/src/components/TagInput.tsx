import { useState, useEffect } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { X } from "lucide-react";

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

export default function TagInput({ tags, onChange, placeholder = "Enter tags separated by commas" }: TagInputProps) {
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    setInputValue(tags.join(", "));
  }, [tags]);

  const handleInputChange = (value: string) => {
    setInputValue(value);
    
    // Parse tags from comma-separated string
    const parsedTags = value
      .split(",")
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
    
    onChange(parsedTags);
  };

  const removeTag = (tagToRemove: string) => {
    const updatedTags = tags.filter(tag => tag !== tagToRemove);
    onChange(updatedTags);
  };

  return (
    <div className="space-y-2" data-testid="tag-input">
      <Label htmlFor="tags">Tags</Label>
      <Input
        id="tags"
        type="text"
        placeholder={placeholder}
        value={inputValue}
        onChange={(e) => handleInputChange(e.target.value)}
        data-testid="input-tags"
      />
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {tags.map((tag, index) => (
            <Badge
              key={`${tag}-${index}`}
              variant="secondary"
              className="flex items-center gap-1"
              data-testid={`badge-tag-${tag}`}
            >
              {tag}
              <X
                className="w-3 h-3 cursor-pointer hover:text-red-600"
                onClick={() => removeTag(tag)}
                data-testid={`button-remove-tag-${tag}`}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
