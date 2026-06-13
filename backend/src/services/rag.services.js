const Knowledge = require("../models/Knowledge");
const embeddingService = require("./embedding.service");

/**
 * Cosine similarity
 */
function cosineSimilarity(a, b) {
  let dot = 0;
  let magA = 0;
  let magB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }

  magA = Math.sqrt(magA);
  magB = Math.sqrt(magB);

  if (magA === 0 || magB === 0) {
    return 0;
  }

  return dot / (magA * magB);
}

/**
 * Retrieve top matching chunks
 */
async function searchKnowledge(query, topK = 5) {
  const queryEmbedding =
    await embeddingService.createEmbedding(query);

  const docs = await Knowledge.find();

  const results = [];

  for (const doc of docs) {
    for (const chunk of doc.chunks) {
      if (
        !chunk.embedding ||
        chunk.embedding.length === 0
      ) {
        continue;
      }

      const score = cosineSimilarity(
        queryEmbedding,
        chunk.embedding
      );

      results.push({
        score,
        filename: doc.filename,
        text: chunk.text
      });
    }
  }

  results.sort((a, b) => b.score - a.score);

  return results.slice(0, topK);
}

module.exports = {
  searchKnowledge
};