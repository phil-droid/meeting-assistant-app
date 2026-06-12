```javascript
const axios = require("axios");
const logger = require("../utils/logger");

/**
 * ===========================================
 * EMBEDDING SERVICE
 * ===========================================
 *
 * Generates vector embeddings through LiteLLM.
 *
 * Configure in .env:
 *
 * LITELLM_BASE_URL=http://localhost:4000
 * LITELLM_API_KEY=your_api_key
 * EMBEDDING_MODEL=text-embedding-3-small
 *
 */

const BASE_URL =
  process.env.LITELLM_BASE_URL || "http://localhost:4000";

const API_KEY =
  process.env.LITELLM_API_KEY || "";

const MODEL =
  process.env.EMBEDDING_MODEL ||
  "text-embedding-3-small";

/**
 * -------------------------------------------
 * Generate embedding
 * -------------------------------------------
 */
async function createEmbedding(text) {
  try {
    if (!text || text.trim() === "") {
      return [];
    }

    const response = await axios.post(
      `${BASE_URL}/embeddings`,
      {
        model: MODEL,
        input: text
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    if (
      response.data &&
      response.data.data &&
      response.data.data.length > 0
    ) {
      return response.data.data[0].embedding;
    }

    return [];
  } catch (err) {
    logger.error(
      "Embedding generation failed:",
      err.response?.data || err.message
    );

    return [];
  }
}

/**
 * -------------------------------------------
 * Cosine similarity
 * -------------------------------------------
 */
function cosineSimilarity(vecA, vecB) {
  if (
    !Array.isArray(vecA) ||
    !Array.isArray(vecB)
  ) {
    return 0;
  }

  if (vecA.length !== vecB.length) {
    return 0;
  }

  let dot = 0;
  let magA = 0;
  let magB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    magA += vecA[i] * vecA[i];
    magB += vecB[i] * vecB[i];
  }

  magA = Math.sqrt(magA);
  magB = Math.sqrt(magB);

  if (magA === 0 || magB === 0) {
    return 0;
  }

  return dot / (magA * magB);
}

/**
 * -------------------------------------------
 * Rank chunks by similarity
 * -------------------------------------------
 */
function rankChunks(queryEmbedding, chunks) {
  return chunks
    .map((chunk) => ({
      ...chunk,
      similarity: cosineSimilarity(
        queryEmbedding,
        chunk.embedding || []
      )
    }))
    .sort(
      (a, b) => b.similarity - a.similarity
    );
}

module.exports = {
  createEmbedding,
  cosineSimilarity,
  rankChunks
};
```
