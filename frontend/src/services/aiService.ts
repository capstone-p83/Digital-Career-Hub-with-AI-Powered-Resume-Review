import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const analyzeResume = async (resumeText: string, targetJob: string, language: 'en' | 'bn') => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `
    You are a professional career coach. Analyze the following resume text for the target job role: "${targetJob}".
    Provide feedback in ${language === 'en' ? 'English' : 'Bengali'}.
    Return the response in JSON format with the following structure:
    {
      "score": number (0-100),
      "feedback": {
        "strengths": string[],
        "weaknesses": string[],
        "suggestions": string[]
      }
    }
    
    Resume Text:
    ${resumeText}
  `,
    config: {
      responseMimeType: "application/json"
    }
  });

  try {
    const text = response.text;
    return JSON.parse(text || "{}");
  } catch (error) {
    console.error("AI Analysis Error:", error);
    throw error;
  }
};

export const getChatResponse = async (message: string, history: any[], language: 'en' | 'bn') => {
  const chat = ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction: `You are a helpful career assistant for a digital career hub. 
      You provide advice on resumes, interviews, and job searches. 
      Respond in ${language === 'en' ? 'English' : 'Bengali'}. 
      Keep advice professional and encouraging.`,
    },
    history: history.map(h => ({
      role: h.role === 'model' ? 'model' : 'user',
      parts: [{ text: h.parts[0].text }]
    }))
  });

  const result = await chat.sendMessage({ message });
  return result.text || "";
};
