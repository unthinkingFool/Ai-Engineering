import { ChatGroq } from "@langchain/groq";
import dotenv from "dotenv";

dotenv.config();

const model = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: process.env.LLM_MODEL || "llama-3.3-70b-versatile",
  temperature: 0.7, // creativity level of the AI response
  maxTokens: 150, //total token limit for the response
  maxRetries: 3, // number of retries in case of failure
});

export const aiResponse = async (query) => {
  try {
    const response = await model.invoke([
      {
        role: "system",
        content: "You are a helpful assistant.",
      },
      {
        role: "user",
        content: query,
      },
    ]);

    return response.content;
  } catch (error) {
    console.error("Error generating AI response:", error);
    throw error;
  }
};