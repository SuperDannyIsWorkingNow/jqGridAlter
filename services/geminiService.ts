import { GoogleGenAI, Type } from "@google/genai";
import { GridRow } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateMockData = async (topic: string, count: number = 20): Promise<GridRow[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate ${count} rows of data for a table about "${topic}". 
      The columns should be: id (unique integer), name (string), role (string), status (Active, Inactive, Pending), salary (number), joinDate (YYYY-MM-DD).`,
      config: {
        systemInstruction: "You are a data generator. Generate realistic JSON data for a data grid based on the user's request.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.INTEGER },
              name: { type: Type.STRING },
              role: { type: Type.STRING },
              status: { type: Type.STRING, enum: ["Active", "Inactive", "Pending"] },
              salary: { type: Type.INTEGER },
              joinDate: { type: Type.STRING },
            },
            required: ["id", "name", "role", "status", "salary", "joinDate"]
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as GridRow[];
    }
    return [];
  } catch (error) {
    console.error("Failed to generate data:", error);
    throw error;
  }
};

export const explainFeature = async (featureName: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Briefly explain the "${featureName}" feature in the context of web data grids (like jqGrid) in 2 sentences. Focus on user benefit.`
    });

    return response.text || "Feature explanation unavailable.";
  } catch (error) {
    console.error(error);
    return "Could not load explanation.";
  }
};
