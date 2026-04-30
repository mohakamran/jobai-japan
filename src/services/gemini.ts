import { GoogleGenAI, Type } from "@google/genai";
import { Job, UserProfile, SkillGapAnalysis } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function extractSkillsFromCV(cvText: string): Promise<string[]> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Extract technical and soft skills from this CV and return a JSON array of strings: \n\n${cvText}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    console.error("Failed to parse skills", e);
    return [];
  }
}

export async function analyzeSkillGap(userSkills: string[], jobDescription: string): Promise<SkillGapAnalysis> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Compare user skills with job description. User skills: ${userSkills.join(", ")}. Job Description: ${jobDescription}. Return match score (0-100), missing skills, and learning roadmap suggestions.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          matchScore: { type: Type.NUMBER },
          missingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
          roadmapSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["matchScore", "missingSkills", "roadmapSuggestions"]
      }
    }
  });

  try {
    return JSON.parse(response.text);
  } catch {
    return { matchScore: 0, missingSkills: [], roadmapSuggestions: [] };
  }
}

export async function generateApplicationDocuments(userProfile: UserProfile, job: Job): Promise<{
  rirekisho: string;
  shokumuKeirekisho: string;
  coverLetter: string;
}> {
  const prompt = `
    User Profile: ${JSON.stringify(userProfile)}
    Job Title: ${job.title}
    Company: ${job.company}
    Job Description: ${job.description}

    Generate three documents:
    1. A professional Japanese 履歴書 (Rirekisho) content in markdown.
    2. A professional Japanese 職務経歴書 (Shokumu Keirekisho) content in markdown.
    3. A professional application email/cover letter in English.
    
    Return as a JSON object.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          rirekisho: { type: Type.STRING },
          shokumuKeirekisho: { type: Type.STRING },
          coverLetter: { type: Type.STRING }
        },
        required: ["rirekisho", "shokumuKeirekisho", "coverLetter"]
      }
    }
  });

  try {
    return JSON.parse(response.text);
  } catch {
    return { rirekisho: "", shokumuKeirekisho: "", coverLetter: "" };
  }
}
