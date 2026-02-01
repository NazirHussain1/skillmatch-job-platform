
import { GoogleGenAI, Type } from "@google/genai";
import { Job, User, MatchResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getSkillMatchAnalysis = async (user: User, job: Job): Promise<MatchResult> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
        Compare the candidate's skills with the job's required skills.
        Candidate Skills: ${user.skills.join(", ")}
        Job Required Skills: ${job.requiredSkills.join(", ")}
        Job Title: ${job.title}
        Job Description: ${job.description}
      `,
      config: {
        systemInstruction: "You are a recruitment expert. Analyze the skill overlap and return a JSON object containing a match score (0-100), a brief reasoning (max 2 sentences), and a list of missing skills.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            reasoning: { type: Type.STRING },
            missingSkills: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["score", "reasoning", "missingSkills"]
        }
      }
    });

    return JSON.parse(response.text.trim()) as MatchResult;
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return {
      score: 50,
      reasoning: "AI analysis unavailable. Manual review suggested.",
      missingSkills: []
    };
  }
};
