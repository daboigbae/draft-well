import { marked } from "marked";

// Configure marked options
marked.setOptions({
  breaks: true,
  gfm: true,
});

export const renderMarkdown = (markdown: string): string => {
  if (!markdown) return "";
  
  try {
    const result = marked(markdown);
    return typeof result === 'string' ? result : markdown;
  } catch (error) {
    console.error("Markdown rendering error:", error);
    return markdown; // Return plain text as fallback
  }
};

export const stripMarkdown = (markdown: string): string => {
  if (!markdown) return "";
  
  return markdown
    .replace(/[#*_`~\[\]()]/g, "") // Remove markdown characters
    .replace(/\n+/g, " ") // Replace newlines with spaces
    .trim();
};
