const axios = require("axios");
const logger = require("../utils/logger");

const BASE_URL = process.env.LITELLM_API_BASE || "http://localhost:4000";
const API_KEY  = process.env.LITELLM_API_KEY  || "anything";
const MODEL    = process.env.LLM_MODEL        || "gpt-3.5-turbo";

const liteLLM = {
  async chat(messages) {
    try {
      const response = await axios.post(
        `${BASE_URL}/chat/completions`,
        { model: MODEL, messages },
        {
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            "Content-Type": "application/json"
          }
        }
      );
      return response.data;
    } catch (err) {
      logger.error("LiteLLM chat error:", err.response?.data || err.message);
      throw new Error(`LiteLLM request failed: ${err.message}`);
    }
  }
};

module.exports = liteLLM;
