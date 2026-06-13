const Knowledge = require("../models/Knowledge");
const { createEmbedding, rankChunks } = require("./embedding.service");
const logger = require("../utils/logger");

const TOP_K = parseInt(process.env.RAG_TOP_K || "5");
const MIN_SIMILARITY = parseFloat(process.env.RAG_MIN_SIMILARITY || "0.3");

/**
 * Search knowledge base for relevant chunks
 */
async function searchKnowledge(query) {
  try {
    // 1. Embed the query
    const queryEmbedding = await createEmbedding(query);

    if (!queryEmbedding || queryEmbedding.length === 0) {
      logger.warn("Could not generate query embedding — returning empty results");
      return [];
    }

    // 2. Load all knowledge docs
    const docs = await Knowledge.find({});

    if (docs.length === 0) return [];

    // 3. Flatten all chunks across all docs
    const allChunks = [];
    for (const doc of docs) {
      for (const chunk of doc.chunks) {
        allChunks.push({
          filename: doc.filename,
          text:     chunk.text,
          embedding: chunk.embedding
        });
      }
    }

    // 4. Rank by cosine similarity
    const ranked = rankChunks(queryEmbedding, allChunks);

    // 5. Return top K above threshold
    return ranked
      .filter(c => c.similarity >= MIN_SIMILARITY)
      .slice(0, TOP_K);

  } catch (err) {
    logger.error("RAG search error:", err);
    return [];
  }
}

module.exports = { searchKnowledge };
