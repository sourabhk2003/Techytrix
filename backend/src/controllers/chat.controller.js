import { GoogleGenAI } from "@google/genai";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

export const chatWithAi = async (req, res) => {
  try {
    const { message, model } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    console.log("DEBUG: GEMINI_API_KEY is", process.env.GEMINI_API_KEY ? "Present" : "Missing");

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY?.trim(),
    });

    const selectedModel = model || "Gemini";
    let reply = "";

    if (selectedModel === "Gemini") {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `You are a helpful AI assistant for the Techytrix LMS platform. Answer as a friendly mentor. Question: ${message}`,
      });
      reply = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text || "No response found";
    } 
    else if (selectedModel === "ChatGPT") {
      if (!process.env.OPENAI_API_KEY) {
         return res.status(200).json({ message: "OpenAI API Key is not configured in .env. Please configure it to use ChatGPT." });
      }
      const response = await axios.post("https://api.openai.com/v1/chat/completions", {
         model: "gpt-4o-mini",
         messages: [{ role: "user", content: message }]
      }, {
         headers: {
            "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
            "Content-Type": "application/json"
         }
      });
      reply = response.data?.choices?.[0]?.message?.content || "No response from ChatGPT";
    }
    else if (selectedModel === "Claude") {
      if (!process.env.ANTHROPIC_API_KEY) {
         return res.status(200).json({ message: "Anthropic API Key is not configured in .env. Please configure it to use Claude." });
      }
      const response = await axios.post("https://api.anthropic.com/v1/messages", {
         model: "claude-3-5-sonnet-20240620",
         max_tokens: 1024,
         messages: [{ role: "user", content: message }]
      }, {
         headers: {
            "x-api-key": process.env.ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
            "Content-Type": "application/json"
         }
      });
      reply = response.data?.content?.[0]?.text || "No response from Claude";
    }
    else {
      return res.status(400).json({ message: "Invalid model selected" });
    }

    return res.status(200).json({ message: reply });

  } catch (error) {
    console.error("Chat API Error:", error.message);
    return res.status(500).json({
      message: `Chat error: ${error.message || "Unknown Error"}`,
      error: error.message,
    });
  }
};
