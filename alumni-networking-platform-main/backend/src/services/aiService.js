/**
 * Default AI Model configuration
 */
const DEFAULT_MODEL = 'gemini-3.5-flash-lite';
const GEMINI_API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

/**
 * System Instruction for AlumniConnect AI Assistant
 */
const SYSTEM_INSTRUCTION = `You are AlumniConnect AI, an AI Career and Learning Assistant for students on the AlumniConnect platform.

Your purpose is to help students with:
- career planning and exploration
- technical learning and roadmaps
- programming concepts and architectures
- technical and behavioral interview preparation
- project ideas and system design
- skills development
- resume optimization and job preparation tips
- mentorship guidance and preparation for meeting alumni mentors

Guidelines:
1. Give accurate, practical, structured, and concise answers.
2. Prefer structured formatting using headings, bullet points, numbered steps, and brief code/conceptual examples where relevant.
3. When appropriate, actively encourage students to leverage AlumniConnect features such as:
   - Jobs & Internships (explore verified alumni job listings)
   - Mentorship Program (schedule 1-on-1 sessions with industry alumni)
   - Collaborative Projects (build real-world initiatives in student-alumni teams)
   - Community Feed & Messaging (network with peers and senior graduates)
4. Do not claim to know university-specific private information unless it is explicitly provided to you in the prompt context.
5. Do not fabricate alumni names, job postings, project listings, companies, or verified mentors. If specific information is unavailable, clearly state so.
6. Do not request or provide sensitive, confidential, or private user credentials.
7. You are an educational and career assistant, not a replacement for professional legal, medical, or financial advice.`;

/**
 * Validate and retrieve Gemini API key from environment
 */
const getGeminiApiKey = () => {
  const rawKey =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.GEMINI_KEY;

  if (!rawKey || typeof rawKey !== 'string') {
    const error = new Error('Gemini API key is not configured on the server. Please set GEMINI_API_KEY in backend/.env');
    error.statusCode = 503;
    error.isConfigError = true;
    throw error;
  }

  // Remove whitespace and accidental surrounding quotes
  const apiKey = rawKey.trim().replace(/^["']|["']$/g, '');

  const isPlaceholder =
    apiKey === '' ||
    apiKey === 'YOUR_GEMINI_API_KEY' ||
    apiKey === 'YOUR_ACTUAL_GEMINI_API_KEY' ||
    apiKey === 'your_google_gemini_api_key_here' ||
    apiKey === 'your_gemini_api_key_here' ||
    apiKey === 'your_gemini_api_key_from_google_ai_studio';

  if (isPlaceholder) {
    const error = new Error('Gemini API key is not configured on the server. Please set GEMINI_API_KEY in backend/.env');
    error.statusCode = 503;
    error.isConfigError = true;
    throw error;
  }

  return apiKey;
};

/**
 * Format conversation history into standard Gemini API content structure
 * @param {Array<{ role: string, content: string }>} history
 * @param {number} maxHistoryMessages
 * @returns {Array<{ role: string, parts: Array<{ text: string }> }>}
 */
const formatGeminiContents = (history = [], currentMessage, maxHistoryMessages = 10) => {
  const contents = [];

  if (Array.isArray(history) && history.length > 0) {
    const recentHistory = history.slice(-maxHistoryMessages);

    for (const item of recentHistory) {
      if (!item || !item.content || typeof item.content !== 'string') continue;
      const content = item.content.trim();
      if (!content) continue;

      const role = item.role === 'assistant' || item.role === 'model' ? 'model' : 'user';
      contents.push({
        role,
        parts: [{ text: content }],
      });
    }
  }

  // Append current user message
  contents.push({
    role: 'user',
    parts: [{ text: currentMessage }],
  });

  return contents;
};

/**
 * Generate AI Response using official Google Gemini API (REST / SDK integration)
 * @param {object} params
 * @param {string} params.message - User prompt
 * @param {Array} [params.history=[]] - Previous conversation messages
 * @param {object} [params.studentContext=null] - Safe student academic profile
 * @returns {Promise<{ message: string, model: string }>}
 */
export const generateAIResponse = async ({ message, history = [], studentContext = null }) => {
  if (!message || typeof message !== 'string' || message.trim() === '') {
    const error = new Error('Message is required and cannot be empty');
    error.statusCode = 400;
    throw error;
  }

  const trimmedMessage = message.trim();
  if (trimmedMessage.length > 2000) {
    const error = new Error('Message exceeds the maximum allowed length of 2000 characters');
    error.statusCode = 400;
    throw error;
  }

  const apiKey = getGeminiApiKey();
  const rawModel = process.env.GEMINI_MODEL || DEFAULT_MODEL;
  // Automatically migrate legacy or deprecated model names to active flash models
  const modelName =
    rawModel === 'gemini-2.5-flash' || rawModel === 'gemini-1.5-flash' || rawModel === 'gemini-2.0-flash'
      ? 'gemini-3.5-flash-lite'
      : rawModel;

  // Construct augmented system instruction with safe student context if available
  let dynamicSystemInstruction = SYSTEM_INSTRUCTION;

  if (studentContext && typeof studentContext === 'object') {
    const contextParts = [];
    if (studentContext.branch) contextParts.push(`Branch: ${studentContext.branch}`);
    if (studentContext.semester) contextParts.push(`Semester: ${studentContext.semester}`);
    if (studentContext.graduationYear) contextParts.push(`Graduation Year: ${studentContext.graduationYear}`);
    if (Array.isArray(studentContext.skills) && studentContext.skills.length > 0) {
      contextParts.push(`Registered Skills: ${studentContext.skills.join(', ')}`);
    }
    if (Array.isArray(studentContext.interests) && studentContext.interests.length > 0) {
      contextParts.push(`Interests: ${studentContext.interests.join(', ')}`);
    }

    if (contextParts.join('\n').length > 0) {
      dynamicSystemInstruction += `\n\n[Student Profile Context]\nThe interacting student has the following academic background:\n${contextParts.join('\n')}\nTailor your guidance, roadmaps, and career tips to align with this student background where relevant.`;
    }
  }

  // Format multi-turn conversation messages
  const contents = formatGeminiContents(history, trimmedMessage, 10);

  const requestPayload = {
    contents,
    systemInstruction: {
      parts: [{ text: dynamicSystemInstruction }],
    },
    generationConfig: {
      maxOutputTokens: 1024,
    },
  };

  // Prioritize active flash models with reliable fallbacks
  const candidateModels = Array.from(
    new Set([
      modelName,
      'gemini-3.5-flash-lite',
      'gemini-3.1-flash-lite',
      'gemini-3.8-flash',
      'gemini-3.5-flash',
    ].filter(Boolean))
  );
  let lastError = null;

  for (const currentModel of candidateModels) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 15000); // 15-second per candidate model timeout to quickly fallback if model is slow

    try {
      const endpointUrl = `${GEMINI_API_BASE_URL}/models/${currentModel}:generateContent?key=${apiKey}`;

      const response = await fetch(endpointUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload),
        signal: controller.signal,
      });

      const responseData = await response.json();

      if (!response.ok) {
        const errorDetail = responseData?.error?.message || response.statusText;
        console.error('[AIService] Gemini request failed:', {
          status: response.status,
          message: errorDetail,
          model: currentModel,
        });

        // Invalid API Key
        if (
          response.status === 400 &&
          (errorDetail.includes('API_KEY') || errorDetail.includes('API key') || errorDetail.includes('INVALID_ARGUMENT'))
        ) {
          const error = new Error('Invalid or unrecognized Gemini API key configured on server.');
          error.statusCode = 500;
          error.isConfigError = true;
          throw error;
        }

        if (response.status === 401 || response.status === 403) {
          const error = new Error('Gemini API authentication failed. Please verify your GEMINI_API_KEY in backend/.env');
          error.statusCode = 500;
          error.isConfigError = true;
          throw error;
        }

        // Quota / Rate limit
        if (response.status === 429 || errorDetail.includes('RESOURCE_EXHAUSTED')) {
          const error = new Error('AI usage quota or rate limit reached. Please try again in a few moments.');
          error.statusCode = 429;
          throw error;
        }

        // High demand (503) or Model not found / deprecated (404) -> Fall back to next candidate model
        if (response.status === 404 || response.status === 503) {
          lastError = new Error(
            response.status === 503
              ? 'AI model service is experiencing high traffic. Please try again shortly.'
              : 'Configured AI model is unavailable.'
          );
          lastError.statusCode = response.status;
          continue;
        }

        const error = new Error('Google Gemini API request failed. Please try again.');
        error.statusCode = response.status >= 500 ? 502 : 400;
        throw error;
      }

      // Extract generated text from candidates
      const candidate = responseData?.candidates?.[0];
      const textPart = candidate?.content?.parts?.[0]?.text;

      if (!textPart) {
        return {
          message: 'I am sorry, but I was unable to generate a response. Please try rephrasing your question.',
          model: currentModel,
        };
      }

      return {
        message: textPart.trim(),
        model: currentModel,
      };
    } catch (err) {
      if (err.name === 'AbortError' || controller.signal.aborted) {
        console.warn(`[AIService] Request timed out after 15s for model ${currentModel}, trying next candidate if available.`);
        lastError = new Error('AI Assistant is taking longer than expected. Please try again.');
        lastError.statusCode = 504;
        continue;
      }

      if (err.isConfigError || err.statusCode === 500 || err.statusCode === 429) {
        throw err;
      }

      console.error('[AIService] Gemini candidate error:', {
        status: err.statusCode || 502,
        message: err.message,
        model: currentModel,
      });
      lastError = err;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  if (lastError) {
    if (lastError.isConfigError || lastError.statusCode) {
      throw lastError;
    }
    const error = new Error('The AI Assistant is currently experiencing connection issues. Please try again.');
    error.statusCode = 502;
    throw error;
  }
};

export default {
  generateAIResponse,
};
