import * as fs from "fs";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface ItemSuggestion {
  description: string;
  tags: string[];
  condition?: string;
}

export async function generateItemSuggestions(
  title: string,
  imagePath?: string
): Promise<ItemSuggestion> {
  try {
    let contents: any[] = [];
    
    if (imagePath && fs.existsSync(imagePath)) {
      const imageBytes = fs.readFileSync(imagePath);
      contents.push({
        inlineData: {
          data: imageBytes.toString("base64"),
          mimeType: "image/jpeg",
        },
      });
    }

    const prompt = `You are an assistant for a clothing exchange platform called ReWear. A user uploaded a clothing item with the title: "${title}".

Based on the ${imagePath ? 'image and title' : 'title'}, generate:
1. A short, appealing product description (max 50 words)
2. 5 relevant tags (e.g., "Vintage", "Denim", "Casual", "Summer", "Formal")
3. Estimated condition (New, Like New, Good, Fair)

Return the response in JSON format:
{
  "description": "...",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "condition": "..."
}`;

    contents.push(prompt);

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            description: { type: "string" },
            tags: { 
              type: "array",
              items: { type: "string" }
            },
            condition: { type: "string" }
          },
          required: ["description", "tags"]
        },
      },
      contents: contents,
    });

    const rawJson = response.text;
    if (rawJson) {
      const data: ItemSuggestion = JSON.parse(rawJson);
      return data;
    } else {
      throw new Error("Empty response from Gemini");
    }
  } catch (error) {
    console.error("Error generating item suggestions:", error);
    throw new Error(`Failed to generate suggestions: ${error}`);
  }
}

export async function moderateContent(text: string): Promise<boolean> {
  try {
    const prompt = `Is the following item description appropriate for a family-friendly clothing exchange platform? Return only "Yes" or "No".

Text: "${text}"`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const result = response.text?.trim().toLowerCase();
    return result === "yes";
  } catch (error) {
    console.error("Error moderating content:", error);
    // Default to allowing content if moderation fails
    return true;
  }
}

export async function parseNaturalSearch(query: string): Promise<{
  category?: string;
  size?: string;
  condition?: string;
  search?: string;
}> {
  try {
    const prompt = `Parse this user search query into structured filter parameters for a fashion exchange site. 
    
Available categories: "Men", "Women", "Kids"
Available sizes: "XS", "S", "M", "L", "XL", "XXL"
Available conditions: "New", "Like New", "Good", "Fair"
    
Return as JSON with only the relevant fields:
{
  "category": "...",
  "size": "...",
  "condition": "...",
  "search": "general search terms"
}

User query: "${query}"`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            category: { type: "string" },
            size: { type: "string" },
            condition: { type: "string" },
            search: { type: "string" }
          }
        },
      },
      contents: prompt,
    });

    const rawJson = response.text;
    if (rawJson) {
      return JSON.parse(rawJson);
    } else {
      return { search: query };
    }
  } catch (error) {
    console.error("Error parsing natural search:", error);
    return { search: query };
  }
}