export const copyToClipboard = async (text: string): Promise<void> => {
  if (navigator.clipboard && window.isSecureContext) {
    // Use the Clipboard API if available
    await navigator.clipboard.writeText(text);
  } else {
    // Fallback for older browsers or non-secure contexts
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
  }
};

export const readFromClipboard = async (): Promise<string> => {
  if (navigator.clipboard && window.isSecureContext) {
    return await navigator.clipboard.readText();
  } else {
    // Fallback not available for reading clipboard in older browsers
    throw new Error("Clipboard read not supported");
  }
};
