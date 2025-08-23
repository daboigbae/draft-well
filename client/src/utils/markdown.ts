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

// Convert markdown to plain text for copying (preserves formatting but removes markdown syntax)
export const markdownToPlainText = (markdown: string): string => {
  if (!markdown) return "";
  
  try {
    // First render to HTML
    const html = marked(markdown);
    const htmlString = typeof html === 'string' ? html : markdown;
    
    // Create a temporary DOM element to strip HTML tags
    const temp = document.createElement('div');
    temp.innerHTML = htmlString;
    
    // Get plain text and clean up whitespace
    let plainText = temp.textContent || temp.innerText || '';
    
    // Clean up whitespace while preserving structure
    plainText = plainText
      .replace(/\n\s*\n/g, '\n\n') // Preserve paragraph breaks
      .replace(/[ \t]+/g, ' ') // Multiple spaces/tabs become single space
      .replace(/\n +/g, '\n') // Remove leading spaces after newlines
      .trim();
      
    return plainText;
  } catch (error) {
    console.error("Markdown to plain text conversion error:", error);
    return markdown; // Return original as fallback
  }
};

// New function for LinkedIn-optimized copying that preserves formatting
export const markdownToLinkedInText = (markdown: string): string => {
  if (!markdown) return "";
  
  try {
    let text = markdown;
    
    // Convert markdown bold to text (LinkedIn doesn't support **bold** but we keep the emphasized text)
    text = text.replace(/\*\*(.*?)\*\*/g, '$1'); // Remove ** but keep the text
    text = text.replace(/\*(.*?)\*/g, '$1'); // Remove * but keep the text
    
    // Convert markdown headings to emphasized text
    text = text.replace(/^#{1,6}\s+(.+)$/gm, '$1'); // Remove # but keep heading text
    
    // Preserve line breaks - ensure double newlines stay as paragraph breaks
    text = text.replace(/\n\n+/g, '\n\n'); // Normalize multiple newlines to double
    text = text.replace(/\n/g, '\n'); // Preserve all line breaks
    
    // Clean up any extra whitespace
    text = text.replace(/[ \t]+/g, ' '); // Multiple spaces/tabs become single space
    text = text.replace(/\n +/g, '\n'); // Remove leading spaces after newlines
    text = text.trim();
      
    return text;
  } catch (error) {
    console.error("Markdown to LinkedIn text conversion error:", error);
    return markdown; // Return original as fallback
  }
};

export const stripMarkdown = (markdown: string): string => {
  if (!markdown) return "";
  
  return markdown
    .replace(/[#*_`~\[\]()]/g, "") // Remove markdown characters
    .replace(/\n+/g, " ") // Replace newlines with spaces
    .trim();
};
