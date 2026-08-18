import { DocumentChunk, VectorSearchResult, SemanticCitation } from '../types';

const EMBEDDING_MODEL = 'text-embedding-3-small';
const VECTOR_DIMENSION = 1536;

/**
 * Splits document content into semantic line-tracked chunks for vector indexing.
 */
export function chunkDocument(documentName: string, content: string, chunkSizeLines = 25, overlapLines = 5): DocumentChunk[] {
  if (!content || !content.trim()) return [];

  const lines = content.split(/\r?\n/);
  const chunks: DocumentChunk[] = [];
  let chunkIndex = 0;
  let currentStart = 0;

  while (currentStart < lines.length) {
    const currentEnd = Math.min(lines.length, currentStart + chunkSizeLines);
    const chunkLines = lines.slice(currentStart, currentEnd);
    const chunkText = chunkLines.join('\n').trim();

    if (chunkText.length > 0) {
      // Rough token estimation (~4 chars/token)
      const tokenCount = Math.max(1, Math.ceil(chunkText.length / 4));
      chunks.push({
        id: `chunk_${documentName.replace(/[^a-zA-Z0-9]/g, '_')}_${chunkIndex}`,
        documentName,
        chunkIndex,
        startLine: currentStart + 1, // 1-indexed
        endLine: currentEnd,
        content: chunkText,
        tokenCount,
      });
      chunkIndex++;
    }

    if (currentEnd >= lines.length) break;
    currentStart += chunkSizeLines - overlapLines;
  }

  return chunks;
}

/**
 * Generates normalized 1536-dimensional embeddings.
 * Tries OpenAI / Microsoft Foundry text-embedding-3-small endpoint first;
 * falls back to high-fidelity deterministic vector hashing when offline or without API key.
 */
export async function generateEmbedding(text: string, apiKey?: string): Promise<number[]> {
  const clean = text.slice(0, 8000);

  if (apiKey) {
    try {
      const endpoint = process.env.AZURE_OPENAI_ENDPOINT
        ? `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/text-embedding-3-small/embeddings?api-version=2024-02-01`
        : 'https://api.openai.com/v1/embeddings';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
          'api-key': apiKey,
        },
        body: JSON.stringify({
          input: clean,
          model: EMBEDDING_MODEL,
          dimensions: VECTOR_DIMENSION,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        const embedding = json.data?.[0]?.embedding;
        if (Array.isArray(embedding) && embedding.length > 0) {
          return embedding;
        }
      }
    } catch {
      // Fall through to deterministic vector generator
    }
  }

  return generateDeterministicVector(clean, VECTOR_DIMENSION);
}

/**
 * Generates batch embeddings for document chunks.
 */
export async function embedChunks(chunks: DocumentChunk[], apiKey?: string): Promise<DocumentChunk[]> {
  const embeddedChunks: DocumentChunk[] = [];
  for (const chunk of chunks) {
    const embedding = await generateEmbedding(chunk.content, apiKey);
    embeddedChunks.push({
      ...chunk,
      embedding,
    });
  }
  return embeddedChunks;
}

/**
 * Cosine similarity between two normalized vectors.
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;
  return dotProduct / denominator;
}

/**
 * Semantic Vector Search across documents.
 */
export async function searchSemanticDocuments(
  query: string,
  documents: { name: string; content?: string }[],
  apiKey?: string,
  topK = 3
): Promise<VectorSearchResult[]> {
  if (!query.trim() || !documents.length) return [];

  const queryVec = await generateEmbedding(query, apiKey);
  const allChunks: DocumentChunk[] = [];

  for (const doc of documents) {
    if (doc.content) {
      const chunks = chunkDocument(doc.name, doc.content);
      allChunks.push(...chunks);
    }
  }

  if (allChunks.length === 0) return [];

  const embedded = await embedChunks(allChunks, apiKey);

  const scored: VectorSearchResult[] = embedded.map((chunk) => {
    const similarity = chunk.embedding ? cosineSimilarity(queryVec, chunk.embedding) : 0;
    return {
      chunk,
      similarity,
    };
  });

  // Sort descending by similarity score
  scored.sort((a, b) => b.similarity - a.similarity);

  return scored.slice(0, topK);
}

/**
 * Formats retrieved chunks into RAG context string with structured citation markers.
 */
export function buildRagPromptContext(results: VectorSearchResult[]): {
  contextPrompt: string;
  citations: SemanticCitation[];
} {
  const citations: SemanticCitation[] = [];

  const contextBlocks = results.map((res, idx) => {
    const { chunk, similarity } = res;
    const citationId = `cite_${idx + 1}`;
    citations.push({
      id: citationId,
      documentName: chunk.documentName,
      startLine: chunk.startLine,
      endLine: chunk.endLine,
      snippet: chunk.content.slice(0, 180),
      score: Math.round(similarity * 100) / 100,
    });

    return `[SOURCE ${idx + 1}: ${chunk.documentName} (Lines ${chunk.startLine}-${chunk.endLine}) | Relevance: ${(similarity * 100).toFixed(1)}%]\n${chunk.content}`;
  });

  const contextPrompt = `=== VERIFIED WORKSPACE VECTOR RAG CONTEXT ===\n${contextBlocks.join('\n\n---\n\n')}\n=== END CONTEXT ===\n\nINSTRUCTION: Ground your response using the verified context above. When referencing facts from a file, include inline citation badges in the exact format: [[cite:${citations[0]?.documentName || 'doc'}#L${citations[0]?.startLine || 1}-L${citations[0]?.endLine || 10}]] or [Doc: filename#L10-L25].`;

  return {
    contextPrompt,
    citations,
  };
}

/**
 * Deterministic vector hashing generator (1536 dimensions) for zero-latency offline RAG.
 */
function generateDeterministicVector(text: string, dim: number): number[] {
  const vec = new Float64Array(dim);
  const normalized = text.toLowerCase();
  const words = normalized.match(/[a-z0-9_]+/g) || ['empty'];

  // Word token and subword n-gram projections
  for (let w = 0; w < words.length; w++) {
    const word = words[w];
    let h1 = 0;
    for (let i = 0; i < word.length; i++) {
      h1 = (h1 * 31 + word.charCodeAt(i)) >>> 0;
    }
    vec[h1 % dim] += 2.0;

    // Character trigrams
    for (let i = 0; i < word.length - 2; i++) {
      const tri = word.slice(i, i + 3);
      let hTri = 0;
      for (let j = 0; j < 3; j++) {
        hTri = (hTri * 37 + tri.charCodeAt(j)) >>> 0;
      }
      vec[hTri % dim] += 0.8;
    }

    // Word bigram
    if (w < words.length - 1) {
      const bigram = `${word}_${words[w + 1]}`;
      let hBi = 0;
      for (let j = 0; j < bigram.length; j++) {
        hBi = (hBi * 41 + bigram.charCodeAt(j)) >>> 0;
      }
      vec[hBi % dim] += 1.5;
    }
  }

  // L2 Normalization
  let norm = 0;
  for (let i = 0; i < dim; i++) norm += vec[i] * vec[i];
  norm = Math.sqrt(norm) || 1;

  const result: number[] = new Array(dim);
  for (let i = 0; i < dim; i++) {
    result[i] = vec[i] / norm;
  }
  return result;
}
