import { GoogleGenAI, Type } from "@google/genai";

let aiClient: GoogleGenAI | null = null;

const getAi = () => {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is missing. AI features will be disabled.");
      return null;
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
};

export interface OnboardingAnalysis {
  suggestedPath: 'PRODUCTIVE' | 'STRONGER' | 'SOCIAL' | 'DISCIPLINE' | 'MENTAL_HEALTH' | 'OTHER';
  statAdjustments: Record<string, number>;
  feedback: string;
}

export const analyzeOnboardingAnswers = async (answers: string[], language: 'en' | 'id'): Promise<OnboardingAnalysis> => {
  const ai = getAi();
  if (!ai) {
    return {
      suggestedPath: 'DISCIPLINE',
      statAdjustments: { discipline: 10, ambition: 10, mental: 5 },
      feedback: language === 'id' ? "Mari kita mulai perjalanan disiplinmu!" : "Let's start your discipline journey!"
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [{
        role: 'user',
        parts: [{
          text: `Analyze these onboarding answers from a user of a self-improvement app called "Lock In".
      The user is answering questions about their morning routine, archetype, energy levels, and goals.
      
      Answers:
      ${answers.join('\n')}
      
      Based on these answers, suggest the most suitable path and provide a brief encouraging feedback in ${language === 'id' ? 'Indonesian' : 'English'}.
      Paths: PRODUCTIVE, STRONGER, SOCIAL, DISCIPLINE, MENTAL_HEALTH, OTHER.
      
      Also suggest stat adjustments for: intellect, physical, social, ambition, discipline, mental.
      Total adjustments should sum to roughly 20-30 points.
      IMPORTANT: Return ALL 6 stats in the statAdjustments object.`
        }]
      }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestedPath: {
              type: Type.STRING,
              enum: ['PRODUCTIVE', 'STRONGER', 'SOCIAL', 'DISCIPLINE', 'MENTAL_HEALTH', 'OTHER']
            },
            statAdjustments: {
              type: Type.OBJECT,
              properties: {
                intellect: { type: Type.NUMBER },
                physical: { type: Type.NUMBER },
                social: { type: Type.NUMBER },
                ambition: { type: Type.NUMBER },
                discipline: { type: Type.NUMBER },
                mental: { type: Type.NUMBER }
              },
              required: ['intellect', 'physical', 'social', 'ambition', 'discipline', 'mental']
            },
            feedback: { type: Type.STRING }
          },
          required: ['suggestedPath', 'statAdjustments', 'feedback']
        }
      }
    });

    // Handle different response structures across SDK versions
    let text = '';
    if (typeof (response as any).text === 'function') {
      text = (response as any).text();
    } else if (typeof (response as any).text === 'string') {
      text = (response as any).text;
    } else if ((response as any).candidates && (response as any).candidates[0]?.content?.parts[0]?.text) {
      text = (response as any).candidates[0].content.parts[0].text;
    }

    if (!text) throw new Error("Could not extract text from Gemini response");
    
    const parsed = JSON.parse(text);
    
    // Final safety check to ensure all stats are numeric
    const stats = parsed.statAdjustments;
    ['intellect', 'physical', 'social', 'ambition', 'discipline', 'mental'].forEach(s => {
      if (typeof stats[s] !== 'number') stats[s] = 0;
    });
    
    return parsed;
  } catch (error) {
    console.error("Error analyzing onboarding answers:", error);
    // Fallback
    return {
      suggestedPath: 'DISCIPLINE',
      statAdjustments: { discipline: 10, ambition: 10, mental: 5 },
      feedback: language === 'id' ? "Mari kita mulai perjalanan disiplinmu!" : "Let's start your discipline journey!"
    };
  }
};
