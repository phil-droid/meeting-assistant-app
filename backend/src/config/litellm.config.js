const axios = require('axios');

class LiteLLMClient {
  constructor() {
    this.apiKey = process.env.LITELLM_API_KEY;
    this.apiBase = process.env.LITELLM_API_BASE || 'https://api.litellm.ai/v1';
    this.model = process.env.LLM_MODEL || 'gpt-3.5-turbo';
    this.client = axios.create({
      baseURL: this.apiBase,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
  }

  async chat(messages, options = {}) {
    try {
      const response = await this.client.post('/chat/completions', {
        model: options.model || this.model,
        messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.max_tokens || 2000,
        ...options
      });
      return response.data;
    } catch (error) {
      throw new Error(`LiteLLM API Error: ${error.message}`);
    }
  }

  async generateText(prompt, options = {}) {
    return this.chat([{ role: 'user', content: prompt }], options);
  }
}

module.exports = new LiteLLMClient();
