import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface OnboardingAnalysis {
  suggestedPath: 'PRODUCTIVE' | 'STRONGER' | 'EXTROVERT' | 'DISCIPLINE' | 'MENTAL_HEALTH' | 'OTHER';
  statAdjustments: Record<string, number>;
  feedback: string;
}

export const analyzeOnboardingAnswers = async (answers: string[], language: 'en' | 'id'): Promise<OnboardingAnalysis> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze these onboarding answers from a user of a self-improvement app called "Lock In".
      The user is answering questions about their morning routine, archetype, energy levels, and goals.
      
      Answers:
      ${answers.join('\n')}
      
      Based on these answers, suggest the most suitable path and provide a brief encouraging feedback in ${language === 'id' ? 'Indonesian' : 'English'}.
      Paths: PRODUCTIVE, STRONGER, EXTROVERT, DISCIPLINE, MENTAL_HEALTH, OTHER.
      
      Also suggest stat adjustments for: intellect, physical, social, ambition, discipline, mental.
      Total adjustments should sum to roughly 20-30 points.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestedPath: {
              type: Type.STRING,
              enum: ['PRODUCTIVE', 'STRONGER', 'EXTROVERT', 'DISCIPLINE', 'MENTAL_HEALTH', 'OTHER']
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
              }
            },
            feedback: { type: Type.STRING }
          },
          required: ['suggestedPath', 'statAdjustments', 'feedback']
        }
      }
    });

    return JSON.parse(response.text);
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
