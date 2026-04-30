import OpenAI from 'openai';

let openaiClient: OpenAI | null = null;

export function getOpenAI(): OpenAI {
  if (!openaiClient) {
    const apiKey = (import.meta as unknown as { env: Record<string, string> }).env?.VITE_OPENAI_API_KEY || (process as unknown as { env: Record<string, string> }).env?.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not configured. Please add it to your secrets.');
    }
    openaiClient = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true // Building for client-side demo as per user request
    });
  }
  return openaiClient;
}

export const aiService = {
  async analyzeJobMatch(resume: string, jobDescription: string) {
    const openai = getOpenAI();
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert career coach specialized in the Japanese tech market. Analyze the resume against the job description and return a JSON object with matchScore (0-100), keyStrengths (array), gaps (array), and localizedAdvice (string)."
        },
        {
          role: "user",
          content: `Resume: ${resume}\n\nJob Description: ${jobDescription}`
        }
      ],
      response_format: { type: "json_object" }
    });
    return JSON.parse(response.choices[0].message.content || '{}');
  },

  async translateToJapanese(text: string, type: 'rirekisho' | 'shokumu' | 'general') {
    const openai = getOpenAI();
    const context = type === 'rirekisho' ? "Standard Japanese Resume (Rirekisho) format" : type === 'shokumu' ? "Professional Work History (Shokumu Keirekisho) format" : "Professional Japanese";
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a professional Japanese translator. Translate the given English text to ${context}. Maintain a highly professional (Keigo) tone suitable for job applications.`
        },
        {
          role: "user",
          content: text
        }
      ]
    });
    return response.choices[0].message.content;
  }
};
