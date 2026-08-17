import { FileAttachment } from '../types';

/**
 * Reads and parses file content in the browser.
 * Extracts text context for prompts from text, markdown, CSV, JSON, and raw documents.
 */
export async function parseUploadedFile(file: File): Promise<FileAttachment> {
  const sizeFormatted = file.size > 1024 * 1024
    ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(file.size / 1024))} KB`;

  // For text-based formats, read full content
  if (
    file.type.includes('text') ||
    file.name.endsWith('.txt') ||
    file.name.endsWith('.md') ||
    file.name.endsWith('.csv') ||
    file.name.endsWith('.json') ||
    file.name.endsWith('.ts') ||
    file.name.endsWith('.js') ||
    file.name.endsWith('.py')
  ) {
    try {
      const text = await file.text();
      // Cap at 200k chars for reasonable token window
      const truncated = text.length > 200000 ? text.slice(0, 200000) + '\n\n... [Content truncated]' : text;
      return {
        name: file.name,
        size: sizeFormatted,
        type: file.type || 'text/plain',
        content: truncated,
      };
    } catch {
      // Fallback
    }
  }

  // For PDFs or binary documents, store metadata & descriptor
  return {
    name: file.name,
    size: sizeFormatted,
    type: file.type || 'application/octet-stream',
    content: `[Attached Document: ${file.name} (${sizeFormatted})]`,
  };
}
