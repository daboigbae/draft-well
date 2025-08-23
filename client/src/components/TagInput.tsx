import { useState, useEffect, useRef } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { X, Plus } from "lucide-react";
import { useAuth } from "../hooks/use-auth";
import { subscribeToUserTags } from "../lib/posts";

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

export default function TagInput({ tags, onChange, placeholder = "Add tags (press Enter or comma to separate)" }: TagInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [allUserTags, setAllUserTags] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  // Subscribe to user's tags for auto-complete
  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToUserTags(user.uid, (userTags) => {
      setAllUserTags(userTags);
    });

    return unsubscribe;
  }, [user]);

  // Update suggestions based on input
  useEffect(() => {
    if (!inputValue.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const filteredSuggestions = allUserTags
      .filter(tag => 
        tag.toLowerCase().includes(inputValue.toLowerCase()) && 
        !tags.includes(tag)
      )
      .slice(0, 5); // Limit to 5 suggestions

    setSuggestions(filteredSuggestions);
    setShowSuggestions(filteredSuggestions.length > 0);
  }, [inputValue, allUserTags, tags]);

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
      setShowSuggestions(false);
    } else if (e.key === ',' && inputValue.trim()) {
      e.preventDefault();
      addTag(inputValue);
      setShowSuggestions(false);
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      // Remove last tag when backspacing with empty input
      const updatedTags = [...tags];
      updatedTags.pop();
      onChange(updatedTags);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    } else if (e.key === 'ArrowDown' && suggestions.length > 0) {
      e.preventDefault();
      // Focus first suggestion (we'll implement this later if needed)
    }
  };

  const selectSuggestion = (suggestion: string) => {
    addTag(suggestion);
    setShowSuggestions(false);
    inputRef.current?.focus();
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
    <div className="space-y-2 relative" data-testid="tag-input">
      <Label htmlFor="tags">Tags</Label>
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Input
            ref={inputRef}
            id="tags"
            type="text"
            placeholder={placeholder}
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => inputValue && setShowSuggestions(suggestions.length > 0)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            data-testid="input-tags"
          />
          {showSuggestions && (
            <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-md shadow-lg max-h-40 overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <div
                  key={suggestion}
                  className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer text-sm text-gray-900 dark:text-gray-100"
                  onClick={() => selectSuggestion(suggestion)}
                  data-testid={`suggestion-${suggestion}`}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}
        </div>
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
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Type tags and press Enter, comma, or click + to add. Press Backspace to remove the last tag.
      </p>
    </div>
  );
}
