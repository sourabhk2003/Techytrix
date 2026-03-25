import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const getCourseFromAI = async (input) => {
  const prompt = `You are a helpful AI assistant for the Techytrix LMS platform, behaving similarly to Gemini.
A user is asking: "${input}"

Your task is to:
1. Generate a friendly, conversational response to the user. If they need support or to contact an educator, politely guide them to check course details or recommend finding relevant courses here. Act like a supportive mentor.
2. Identify the most relevant single keyword from this list for course filtering:
   - Web Development
   - UI/UX
   - App Development
   - Ethical Hacking
   - AI/ML
   - Data Science
   - Other
   - Beginner
   - Intermediate
   - Advanced

You MUST return the response in **JSON format** with exactly this structure:
{
  "reply": "Your conversational response here.",
  "keyword": "One keyword from list or 'Other'"
}
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json"
    }
  });

  const text =
  response.text ||
  response.candidates?.[0]?.content?.parts?.[0]?.text ||
  "{ \"reply\": \"No answers found\", \"keyword\": \"Other\" }";

return text.trim();

 
};
