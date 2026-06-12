const logger = require('../utils/logger');
const recordings = require('../routes/recordings.routes').recordings;

/**
 * =========================
 * SIMPLE RAG RETRIEVER
 * =========================
 * (upgrade later to embeddings + vector DB)
 */
function searchRecordings(query) {
  const all = Array.from(recordings.values());

  const lowerQuery = query.toLowerCase();

  /**
   * Basic keyword matching over:
   * - transcript
   * - summary
   * - title
   */
  const results = all.filter(r => {
    const text = `
      ${r.title || ''}
      ${r.transcription || ''}
      ${r.summary || ''}
    `.toLowerCase();

    return text.includes(lowerQuery);
  });

  return results.slice(0, 5);
}

/**
 * =========================
 * BUILD CONTEXT FOR LLM
 * =========================
 */
function buildContext(recordings, query) {
  if (!recordings.length) {
    return 'No relevant meeting data found.';
  }

  return recordings.map(r => `
MEETING: ${r.title}

SUMMARY:
${r.summary || 'N/A'}

TRANSCRIPT (snippet):
${(r.transcription || '').slice(0, 800)}

ACTION ITEMS:
${JSON.stringify(r.actions || [], null, 2)}
`).join('\n\n---\n\n');
}

module.exports = {
  searchRecordings,
  buildContext
};