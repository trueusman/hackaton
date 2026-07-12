const { GoogleGenerativeAI } = require('@google/generative-ai');
const env = require('./env');

let client = null;

function getGeminiModel() {
  if (!env.GEMINI_API_KEY) {
    return null;
  }
  if (!client) {
    client = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  }
  return client.getGenerativeModel({
    model: env.GEMINI_MODEL,
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.3,
    },
  });
}

module.exports = { getGeminiModel };
