const { getGeminiModel } = require('../config/gemini');
const AppError = require('../errors/AppError');
const { ALL_PRIORITIES } = require('../constants/issueStatus');

const AI_TIMEOUT_MS = 12000;

const SYSTEM_INSTRUCTION = `You are the AI Issue Triage assistant inside MaintainIQ, a facility maintenance
platform. You convert a plain-language complaint about a physical asset into structured maintenance data.

Rules you must follow strictly:
- Output MUST be a single JSON object matching the schema described below. No prose, no markdown fences.
- Never give unsafe hands-on instructions for electrical, mechanical, fire, medical, or industrial hazards
  (e.g. never tell a non-technician to open a live electrical panel, handle refrigerant, or touch exposed wiring).
  Instead, phrase such checks as things to visually observe or to have a qualified technician verify.
- If the complaint describes anything that could be a safety hazard (sparking, burning smell, gas smell,
  exposed wiring, structural damage, water near electricity), you MUST mention recommending a qualified
  technician immediately in initialChecks or recurringPatternWarning.
- Priority must be one of: ${ALL_PRIORITIES.join(', ')}. Safety-hazard complaints should be "Critical" or "High".
- possibleCauses and initialChecks must be short arrays of concise strings (max 6 items each), not paragraphs.
- recurringPatternWarning should be null unless the provided history suggests a repeated/recurring problem.

JSON schema:
{
  "title": string,               // professional, concise issue title
  "category": string,            // e.g. "Electrical", "Plumbing", "HVAC", "Mechanical", "Software", "General"
  "priority": "Low" | "Medium" | "High" | "Critical",
  "possibleCauses": string[],
  "initialChecks": string[],
  "recurringPatternWarning": string | null
}`;

function buildPrompt({ asset, complaint, recentHistory }) {
  const assetContext = [
    `Asset name: ${asset.name}`,
    `Category: ${asset.category}`,
    asset.model ? `Model: ${asset.model}` : null,
    `Condition: ${asset.condition}`,
    `Location: ${asset.location}`,
    `Current status: ${asset.status}`,
  ]
    .filter(Boolean)
    .join('\n');

  const historyContext =
    recentHistory && recentHistory.length
      ? recentHistory.map((h) => `- ${h.message}`).join('\n')
      : 'No significant recent history recorded.';

  return `${SYSTEM_INSTRUCTION}

ASSET CONTEXT:
${assetContext}

RECENT ASSET HISTORY:
${historyContext}

USER COMPLAINT:
"""${complaint}"""

Respond with ONLY the JSON object described above.`;
}

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('AI_TIMEOUT')), ms)),
  ]);
}

function validateTriageShape(data) {
  if (!data || typeof data !== 'object') return false;
  const { title, category, priority, possibleCauses, initialChecks } = data;
  if (typeof title !== 'string' || !title.trim()) return false;
  if (typeof category !== 'string' || !category.trim()) return false;
  if (!ALL_PRIORITIES.includes(priority)) return false;
  if (!Array.isArray(possibleCauses) || !possibleCauses.every((c) => typeof c === 'string')) return false;
  if (!Array.isArray(initialChecks) || !initialChecks.every((c) => typeof c === 'string')) return false;
  if (data.recurringPatternWarning !== null && typeof data.recurringPatternWarning !== 'string') return false;
  return true;
}

// The single entry point the rest of the app calls. Throws typed AppErrors
// on any failure mode so the controller/frontend can render a graceful
// "AI unavailable - enter details manually" state instead of a hard crash.
async function triageIssue({ asset, complaint, recentHistory = [] }) {
  const model = getGeminiModel();
  if (!model) {
    throw AppError.badRequest('AI triage is not configured on this server', 'AI_NOT_CONFIGURED');
  }

  const prompt = buildPrompt({ asset, complaint, recentHistory });

  let result;
  try {
    result = await withTimeout(model.generateContent(prompt), AI_TIMEOUT_MS);
  } catch (err) {
    if (err.message === 'AI_TIMEOUT') {
      throw AppError.badRequest('AI triage timed out, please enter details manually', 'AI_TIMEOUT');
    }
    throw AppError.badRequest(`AI triage service unavailable: ${err.message}`, 'AI_UNAVAILABLE');
  }

  const text = result.response.text();
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw AppError.badRequest('AI returned an invalid response, please enter details manually', 'AI_INVALID_OUTPUT');
  }

  if (!validateTriageShape(parsed)) {
    throw AppError.badRequest('AI response failed validation, please enter details manually', 'AI_INVALID_OUTPUT');
  }

  return parsed;
}

module.exports = { triageIssue, validateTriageShape };
